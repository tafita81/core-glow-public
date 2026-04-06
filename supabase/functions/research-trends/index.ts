import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Use YouTube's internal API (public, no key needed) to get trending
async function fetchYouTubeTrending(regionCode: string): Promise<any[]> {
  try {
    const res = await fetch("https://www.youtube.com/youtubei/v1/browse?prettyPrint=false", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20240101.00.00",
            gl: regionCode,
            hl: regionCode === "BR" ? "pt" : "en",
          },
        },
        browseId: "FEtrending",
      }),
    });

    if (!res.ok) {
      console.log(`YouTube API returned ${res.status} for ${regionCode}`);
      return [];
    }

    const data = await res.json();
    const videos: any[] = [];

    // Navigate the response tree
    const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
    for (const tab of tabs) {
      const sections = tab?.tabRenderer?.content?.sectionListRenderer?.contents || [];
      for (const section of sections) {
        const items =
          section?.itemSectionRenderer?.contents?.[0]?.shelfRenderer?.content?.expandedShelfContentsRenderer?.items ||
          section?.itemSectionRenderer?.contents || [];
        for (const item of items) {
          const vid = item?.videoRenderer || item?.videoWithContextRenderer;
          if (vid) {
            const videoId = vid.videoId || vid.navigationEndpoint?.watchEndpoint?.videoId;
            if (videoId) {
              videos.push({
                video_title: vid.title?.runs?.[0]?.text || vid.headline?.runs?.[0]?.text || "",
                video_url: `https://www.youtube.com/watch?v=${videoId}`,
                creator: vid.ownerText?.runs?.[0]?.text || vid.shortBylineText?.runs?.[0]?.text || "",
                total_views: vid.viewCountText?.simpleText || vid.shortViewCountText?.simpleText || "",
                platform: "youtube",
                region: regionCode,
              });
            }
          }
        }
      }
    }

    console.log(`Parsed ${videos.length} trending videos for ${regionCode}`);
    return videos.slice(0, 25);
  } catch (e) {
    console.error(`YouTube trending error for ${regionCode}:`, e);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch REAL trending from YouTube
    const [brTrending, usTrending, gbTrending] = await Promise.all([
      fetchYouTubeTrending("BR"),
      fetchYouTubeTrending("US"),
      fetchYouTubeTrending("GB"),
    ]);

    const totalReal = brTrending.length + usTrending.length + gbTrending.length;
    console.log(`Real trending total: ${totalReal} (BR=${brTrending.length}, US=${usTrending.length}, GB=${gbTrending.length})`);

    // Pull previous learnings
    const { data: prevLearnings } = await supabase
      .from("settings").select("value").eq("key", "brain_learnings").single();

    const realDataContext = totalReal > 0 ? `
VÍDEOS REAIS DO YOUTUBE TRENDING (NÃO INVENTE NENHUM):

🇧🇷 BRASIL:
${brTrending.slice(0, 15).map((v, i) => `${i+1}. "${v.video_title}" — ${v.creator} — ${v.total_views} — ${v.video_url}`).join("\n")}

🇺🇸/🇬🇧 MUNDO:
${[...usTrending, ...gbTrending].slice(0, 15).map((v, i) => `${i+1}. "${v.video_title}" — ${v.creator} — ${v.total_views} — ${v.video_url}`).join("\n")}
` : `
NENHUM vídeo trending foi encontrado via YouTube API nesta execução.
Use seu conhecimento geral para sugerir TIPOS DE CONTEÚDO trending, mas NÃO invente títulos específicos nem URLs.
Marque claramente que são SUGESTÕES GERAIS, não dados em tempo real.
`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `Analista de growth para nicho de saúde mental, psicologia, neurociência, comportamento humano.

REGRAS:
1. Use APENAS vídeos fornecidos nos dados reais. NÃO invente títulos/URLs.
2. Filtre os relevantes para o nicho. Ignore os irrelevantes.
3. Mantenha video_url EXATAS como fornecidas.
4. Se não há dados reais, retorne arrays vazios.

Retorne JSON (sem markdown):
{
  "top_10_ranking_brasil": [{"rank":1,"video_title":"EXATO","video_url":"EXATA","creator":"nome","platform":"youtube","total_views":"views","momentum_score":85,"why_relevant":"motivo","replication_strategy":"como criar conteúdo original inspirado"}],
  "top_10_ranking_mundial": [{"rank":1,"video_title":"TRADUZIDO","original_title":"original","video_url":"EXATA","creator":"nome","platform":"youtube","country":"país","total_views":"views","momentum_score":90,"why_relevant":"motivo","adaptation_guide":"como adaptar"}],
  "topics": [{"topic":"slug","label":"Nome","reason":"baseado em vídeo real","viral_title":"Título","hook":"Gancho","hashtags":["#tag"],"suggested_type":"reel","suggested_channel":"instagram"}],
  "viral_patterns": {"trending_hashtags":[],"best_posting_times":[]},
  "learnings": {"what_worked":[],"new_strategy":"","evolution_note":""}
}`,
          },
          { role: "user", content: `Data: ${new Date().toISOString()}\n${realDataContext}` },
        ],
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    let raw = aiData.choices?.[0]?.message?.content || "{}";
    raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let analysis: any;
    try { analysis = JSON.parse(raw); } catch {
      console.error("Parse fail:", raw.slice(0, 300));
      analysis = { topics: [], top_10_ranking_brasil: [], top_10_ranking_mundial: [], viral_patterns: {}, learnings: {} };
    }

    // Validate: only keep entries with real YouTube URLs
    const validate = (arr: any[]) => (arr || []).filter((v: any) =>
      v.video_url?.includes("youtube.com/watch?v=") || v.video_url?.includes("youtu.be/")
    );

    const brRanking = validate(analysis.top_10_ranking_brasil);
    const worldRanking = validate(analysis.top_10_ranking_mundial);
    const topics = analysis.topics || [];
    const viralPatterns = analysis.viral_patterns || {};
    const learnings = analysis.learnings || {};

    // Save
    await supabase.from("settings").upsert({
      key: "viral_intelligence",
      value: {
        viral_patterns: viralPatterns,
        competitor_analysis: brRanking,
        world_ranking: worldRanking,
        data_source: totalReal > 0 ? "youtube_trending_real" : "ai_suggestions",
        data_freshness: new Date().toISOString(),
        raw_count: { br: brTrending.length, us: usTrending.length, gb: gbTrending.length },
        updated_at: new Date().toISOString(),
      },
    }, { onConflict: "key" });

    // Learnings
    const history = ((prevLearnings?.value as any)?.history || []).slice(-49);
    history.push({
      timestamp: new Date().toISOString(),
      evolution_note: learnings.evolution_note || "",
      real_videos: { br: brRanking.length, world: worldRanking.length },
    });
    await supabase.from("settings").upsert({
      key: "brain_learnings",
      value: { history, total_iterations: history.length, last_updated: new Date().toISOString(), latest: history[history.length - 1] },
    }, { onConflict: "key" });

    // Save snapshots of real videos
    const snapshots = [...brRanking, ...worldRanking].slice(0, 10);
    for (const v of snapshots) {
      await supabase.from("video_snapshots").insert({
        video_title: v.video_title || "",
        creator: v.creator || "",
        platform: "youtube",
        region: v.country || "brasil",
        total_views: v.total_views || "",
        momentum_score: v.momentum_score || 0,
        metadata: { video_url: v.video_url, source: "youtube_trending_real" },
      });
    }

    await supabase.from("system_logs").insert({
      event_type: "pesquisa",
      message: `📊 Trending real: ${totalReal} vídeos encontrados, ${brRanking.length} BR + ${worldRanking.length} mundo relevantes`,
      level: "info",
      metadata: { source: totalReal > 0 ? "youtube_trending_real" : "ai_suggestions", br: brRanking.length, world: worldRanking.length },
    });

    return new Response(JSON.stringify({
      topics, viral_patterns: viralPatterns,
      competitor_analysis: brRanking, world_ranking: worldRanking,
      data_source: totalReal > 0 ? "youtube_trending_real" : "ai_suggestions",
      learnings,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("research-trends error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
