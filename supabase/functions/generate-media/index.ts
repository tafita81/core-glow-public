import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { content_id } = await req.json();
    if (!content_id) {
      return new Response(JSON.stringify({ error: "content_id obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: content, error: fetchErr } = await supabase
      .from("contents")
      .select("*")
      .eq("id", content_id)
      .single();
    if (fetchErr || !content) throw new Error("Conteúdo não encontrado");

    // Generate thumbnail/cover image using AI
    const imagePrompt = await generateImagePrompt(content, LOVABLE_API_KEY);
    
    // Generate image via Lovable AI image generation
    const imageRes = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    let thumbnailUrl = null;
    if (imageRes.ok) {
      const imageData = await imageRes.json();
      const imageB64 = imageData.data?.[0]?.b64_json;
      
      if (imageB64) {
        // Upload to storage
        const fileName = `thumbnails/${content_id}_${Date.now()}.png`;
        const imageBytes = Uint8Array.from(atob(imageB64), c => c.charCodeAt(0));
        
        const { error: uploadErr } = await supabase.storage
          .from("media")
          .upload(fileName, imageBytes, { contentType: "image/png", upsert: true });

        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("media").getPublicUrl(fileName);
          thumbnailUrl = urlData.publicUrl;
        }
      }
    }

    // Generate narration script for video content types
    let audioUrl = null;
    if (content.content_type === "reel" || content.content_type === "story") {
      // Generate a narration script optimized for TTS
      const narrationRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `Transforme o conteúdo abaixo em um roteiro de narração fluido e natural para vídeo em português brasileiro.
O roteiro deve:
- Ser conversacional e acolhedor
- Ter pausas naturais (use ... para pausas)
- Durar entre 30-60 segundos quando lido em voz alta
- Começar com um gancho forte
- Terminar com uma reflexão ou chamada para ação
Retorne APENAS o texto da narração, sem instruções de cena.`,
            },
            { role: "user", content: `Título: ${content.title}\n\n${content.body}` },
          ],
        }),
      });

      if (narrationRes.ok) {
        const narrationData = await narrationRes.json();
        const narrationText = narrationData.choices?.[0]?.message?.content || "";
        
        if (narrationText) {
          // Store narration script in metadata for TTS processing
          // TTS will be processed when ElevenLabs key is configured
          const scriptFileName = `scripts/${content_id}_narration.txt`;
          const encoder = new TextEncoder();
          await supabase.storage
            .from("media")
            .upload(scriptFileName, encoder.encode(narrationText), { 
              contentType: "text/plain", upsert: true 
            });

          // Try ElevenLabs TTS if configured
          const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
          if (ELEVENLABS_API_KEY) {
            const ttsRes = await fetch(
              "https://api.elevenlabs.io/v1/text-to-speech/FGY2WhTYpPnrIDTdsKH5?output_format=mp3_44100_128",
              {
                method: "POST",
                headers: {
                  "xi-api-key": ELEVENLABS_API_KEY,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  text: narrationText,
                  model_id: "eleven_multilingual_v2",
                  voice_settings: { stability: 0.6, similarity_boost: 0.75, style: 0.4 },
                }),
              }
            );

            if (ttsRes.ok) {
              const audioBuffer = await ttsRes.arrayBuffer();
              const audioFileName = `audio/${content_id}_narration.mp3`;
              await supabase.storage
                .from("media")
                .upload(audioFileName, new Uint8Array(audioBuffer), {
                  contentType: "audio/mpeg", upsert: true,
                });
              const { data: audioUrlData } = supabase.storage.from("media").getPublicUrl(audioFileName);
              audioUrl = audioUrlData.publicUrl;
            }
          }
        }
      }
    }

    // Update content with media URLs
    const updates: Record<string, any> = {};
    if (thumbnailUrl) updates.thumbnail_url = thumbnailUrl;
    if (audioUrl) updates.audio_url = audioUrl;

    if (Object.keys(updates).length > 0) {
      await supabase.from("contents").update(updates).eq("id", content_id);
    }

    await supabase.from("system_logs").insert({
      event_type: "midia",
      message: `Mídia gerada para "${content.title}" — Imagem: ${thumbnailUrl ? "✓" : "✗"}, Áudio: ${audioUrl ? "✓" : "✗"}`,
      level: "info",
      metadata: { content_id, thumbnailUrl, audioUrl },
    });

    return new Response(JSON.stringify({ thumbnailUrl, audioUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-media error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function generateImagePrompt(content: any, apiKey: string): Promise<string> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content: `Crie um prompt em inglês para gerar uma imagem profissional para uma postagem de saúde mental nas redes sociais.
A imagem deve ser:
- Acolhedora e calma
- Com cores suaves (lavanda, azul claro, verde menta)
- Estilo minimalista e moderno
- Sem texto na imagem
- Sem rostos reais de pessoas
- Pode ter silhuetas, ilustrações abstratas, natureza
Retorne APENAS o prompt em inglês, sem aspas.`,
        },
        { role: "user", content: `Tema: ${content.topic}\nTítulo: ${content.title}` },
      ],
    }),
  });

  if (res.ok) {
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "Calming minimalist mental health illustration, soft lavender and mint colors, abstract peaceful design, professional social media post";
  }
  return "Calming minimalist mental health illustration, soft lavender and mint colors, abstract peaceful design, professional social media post";
}
