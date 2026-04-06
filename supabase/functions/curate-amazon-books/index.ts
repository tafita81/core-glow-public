import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const { topics: requestTopics, platform } = body;

    // Get Amazon affiliate tag
    const { data: affiliateRow } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "amazon_affiliate_tag")
      .single();
    const affiliateTag = (affiliateRow?.value as any)?.tag || "";

    if (!affiliateTag) {
      return new Response(JSON.stringify({
        message: "Amazon affiliate tag não configurado. Vá em Configurações para adicionar.",
        books: [],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get viral intelligence for trending topics
    const { data: viralRow } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "viral_intelligence")
      .single();
    const viralIntel = (viralRow?.value as any) || {};

    // Get brain learnings for what topics perform best
    const { data: learningsRow } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "brain_learnings")
      .single();
    const learnings = (learningsRow?.value as any) || {};

    // Get recent WhatsApp content to understand conversation topics
    const { data: recentWhatsapp } = await supabase
      .from("whatsapp_content")
      .select("title, content_type, body")
      .order("created_at", { ascending: false })
      .limit(10);

    // Get top performing content topics
    const { data: topContents } = await supabase
      .from("contents")
      .select("title, topic, score, channel")
      .gte("score", 60)
      .order("score", { ascending: false })
      .limit(15);

    const trendingTopics = requestTopics || (viralIntel?.viral_patterns?.top_title_hooks || []).slice(0, 5);
    const topicsList = (topContents || []).map((c: any) => c.topic).filter(Boolean);
    const whatsappTopics = (recentWhatsapp || []).map((w: any) => w.title).join(", ");

    // AI curates the PERFECT book catalog
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um CURADOR EDITORIAL EXPERT em livros de psicologia, saúde mental, autoajuda e desenvolvimento pessoal. Sua missão é selecionar livros que as pessoas VÃO QUERER comprar naturalmente, sem parecer anúncio.

ESTRATÉGIA DO PDF ORIGINAL:
- NÃO é anúncio — é RECOMENDAÇÃO GENUÍNA como amiga
- Os livros devem se conectar com os TEMAS que as pessoas estão discutindo nos grupos e nos comentários
- Cada livro deve resolver uma DOR REAL que apareceu nas conversas
- Use linguagem como: "Esse livro mudou minha forma de ver X" ou "Se vocês gostaram do último post sobre Y, esse livro vai muito além"
- NUNCA diga "compre" — diga "vale muito a pena ler", "esse eu li e recomendo"

REGRAS DE CURADORIA:
1. Selecione APENAS livros REAIS best-sellers disponíveis na Amazon Brasil
2. Use o ISBN-13 ou ASIN real quando souber
3. Priorize livros em PORTUGUÊS (com edição brasileira)
4. Mix: 60% psicologia/saúde mental + 20% desenvolvimento pessoal + 20% neurociência/comportamento
5. Inclua variação de preço (barato + médio + premium)
6. Para cada livro, gere uma MICRO-RESENHA pessoal (como estudante de psicologia falaria)
7. Adapte por plataforma: WhatsApp = conversa, Instagram = visual, YouTube = descrição, Pinterest = pin

FORMATOS DE LINK:
- Amazon: https://www.amazon.com.br/dp/{ASIN}?tag={AFFILIATE_TAG}
- Use o tag: "${affiliateTag}"

Retorne JSON:
{
  "catalog": [
    {
      "title": "Título do livro",
      "author": "Autor",
      "asin": "ASIN ou ISBN",
      "amazon_url": "https://www.amazon.com.br/dp/ASIN?tag=${affiliateTag}",
      "category": "ansiedade|relacionamentos|trauma|autoconhecimento|neurociência|comportamento|desenvolvimento_pessoal",
      "micro_review": "Resenha pessoal de 1-2 frases como estudante de psicologia",
      "whatsapp_mention": "Frase natural para mencionar no grupo WhatsApp",
      "instagram_caption": "Frase para caption no Instagram (com emoji)",
      "pinterest_description": "Descrição para pin no Pinterest (SEO otimizado)",
      "youtube_mention": "Frase para mencionar em vídeo/descrição",
      "connection_to_topic": "Qual tema/dor esse livro resolve",
      "price_range": "barato|medio|premium",
      "relevance_score": 0-100
    }
  ],
  "whatsapp_catalog_message": "Mensagem completa para o grupo WhatsApp com 3-5 livros recomendados de forma NATURAL (não parecer anúncio). Use formato de lista com emojis.",
  "instagram_story_books": ["3 livros para recomendar em Stories com link"],
  "pinterest_board_pins": [{"title": "título do pin", "description": "descrição SEO", "book_url": "link"}],
  "weekly_theme": "Tema da semana que conecta os livros",
  "strategy_notes": "Notas sobre a estratégia de monetização sutil"
}

Retorne APENAS JSON, sem markdown.`
          },
          {
            role: "user",
            content: `CURADORIA DE LIVROS — ${new Date().toISOString().slice(0, 10)}

TÓPICOS TRENDING NAS REDES:
${trendingTopics.join(", ") || "psicologia, ansiedade, relacionamentos, autoconhecimento"}

TÓPICOS DOS NOSSOS MELHORES CONTEÚDOS (por score):
${topicsList.join(", ") || "saúde mental, autoajuda"}

CONVERSAS RECENTES NO WHATSAPP:
${whatsappTopics || "temas gerais de psicologia"}

APRENDIZADO DO CÉREBRO:
O que funciona: ${(learnings?.latest?.what_worked || []).join("; ") || "primeira curadoria"}

PLATAFORMA FOCO: ${platform || "todas"}

Selecione 8-12 livros REAIS best-sellers que se conectam com esses temas. Foque em livros que as pessoas dos grupos WhatsApp vão querer ler NATURALMENTE. Gere a mensagem WhatsApp de catálogo sutil.`
          }
        ],
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    let raw = aiData.choices?.[0]?.message?.content || "{}";
    raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let catalog: any;
    try {
      catalog = JSON.parse(raw);
    } catch {
      catalog = { catalog: [], raw_analysis: raw };
    }

    // Save catalog to settings
    await supabase.from("settings").upsert({
      key: "amazon_book_catalog",
      value: {
        ...catalog,
        affiliate_tag: affiliateTag,
        last_curated: new Date().toISOString(),
        topics_used: trendingTopics,
      },
    }, { onConflict: "key" });

    // Log
    await supabase.from("system_logs").insert({
      event_type: "monetizacao",
      message: `📚 Catálogo Amazon curado: ${(catalog.catalog || []).length} livros selecionados — Tema: "${catalog.weekly_theme || "variado"}" — Tag: ${affiliateTag}`,
      level: "info",
      metadata: {
        books_count: (catalog.catalog || []).length,
        categories: [...new Set((catalog.catalog || []).map((b: any) => b.category))],
        affiliate_tag: affiliateTag,
        weekly_theme: catalog.weekly_theme,
      },
    });

    return new Response(JSON.stringify(catalog), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("curate-amazon-books error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
