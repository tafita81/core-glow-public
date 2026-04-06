import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Fetch real trending data from YouTube RSS feed (public, no API key needed)
async function fetchYouTubeTrending(region: string): Promise<any[]> {
  try {
    const url = `https://www.youtube.com/feed/trending?gl=${region}&hl=pt`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TrendBot/1.0)" },
    });
    if (!res.ok) return [];
    const html = await res.text();

    // Extract video data from YouTube's initial data JSON
    const match = html.match(/var ytInitialData = ({.*?});<\/script>/s);
    if (!match) return [];

    try {
      const data = JSON.parse(match[1]);
      const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
      const videos: any[] = [];

      for (const tab of tabs) {
        const sections = tab?.tabRenderer?.content?.sectionListRenderer?.contents || [];
        for (const section of sections) {
          const items = section?.itemSectionRenderer?.contents?.[0]?.shelfRenderer?.content?.expandedShelfContentsRenderer?.items || [];
          for (const item of items) {
            const vid = item?.videoRenderer;
            if (vid) {
              videos.push({
                video_title: vid.title?.runs?.[0]?.text || "",
                video_url: `https://www.youtube.com/watch?v=${vid.videoId}`,
                creator: vid.ownerText?.runs?.[0]?.text || "",
                creator_url: vid.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl
                  ? `https://www.youtube.com${vid.ownerText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl}`
                  : "",
                total_views: vid.viewCountText?.simpleText || vid.shortViewCountText?.simpleText || "",
                platform: "youtube",
                region,
              });
            }
          }
        }
      }
      return videos.slice(0, 20);
    } catch {
      return [];
    }
  } catch (e) {
    console.error(`YouTube trending fetch failed for ${region}:`, e);
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

    // Fetch REAL trending data from YouTube (no API key needed)
    const [brTrending, usTrending, globalTrending] = await Promise.all([
      fetchYouTubeTrending("BR"),
      fetchYouTubeTrending("US"),
      fetchYouTubeTrending("GB"),
    ]);

    console.log(`Fetched real trending: BR=${brTrending.length}, US=${usTrending.length}, GB=${globalTrending.length}`);

    // Pull historical data for learning
    const [{ data: topContents }, { data: prevLearnings }] = await Promise.all([
      supabase.from("contents").select("title, topic, channel, content_type, score, status")
        .gte("score", 70).order("score", { ascending: false }).limit(10),
      supabase.from("settings").select("value").eq("key", "brain_learnings").single(),
    ]);

    const realVideosContext = `
VÍDEOS REAIS DO YOUTUBE TRENDING (dados verificados, NÃO inventados):

🇧🇷 BRASIL TRENDING:
${brTrending.map((v, i) => `${i+1}. "${v.video_title}" por ${v.creator} — ${v.total_views} — URL: ${v.video_url}`).join("\n") || "Nenhum dado disponível"}

🇺🇸 EUA TRENDING:
${usTrending.map((v, i) => `${i+1}. "${v.video_title}" por ${v.creator} — ${v.total_views} — URL: ${v.video_url}`).join("\n") || "Nenhum dado disponível"}

🇬🇧 UK TRENDING:
${globalTrending.map((v, i) => `${i+1}. "${v.video_title}" por ${v.creator} — ${v.total_views} — URL: ${v.video_url}`).join("\n") || "Nenhum dado disponível"}

HISTÓRICO DE CONTEÚDOS GERADOS:
${(topContents || []).map((c: any, i: number) => `${i+1}. "${c.title}" — Score: ${c.score}`).join("\n") || "Nenhum conteúdo gerado ainda."}

LIÇÕES ANTERIORES:
${prevLearnings?.value ? JSON.stringify((prevLearnings.value as any).latest || {}) : "Primeira execução."}
`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um analista de growth hacking para conteúdo de saúde mental, comportamento humano e desenvolvimento pessoal.

REGRA ABSOLUTA: Você NÃO pode inventar vídeos, títulos ou URLs. Use APENAS os vídeos reais fornecidos nos dados.

Sua tarefa:
1. Dos vídeos reais do YouTube Trending fornecidos, selecione os mais relevantes para o nicho (saúde mental, psicologia, autoajuda, neurociência, relacionamentos, comportamento humano)
2. Se um vídeo trending NÃO é do nicho, IGNORE — não o inclua
3. Para cada vídeo selecionado, analise o potencial de inspiração para criar conteúdo ORIGINAL
4. Gere tópicos de conteúdo INSPIRADOS nos trends reais

IMPORTANTE: Mantenha os video_url EXATOS como fornecidos. NÃO modifique URLs.

Retorne JSON:
{
  "top_10_ranking_brasil": [
    {
      "rank": 1,
      "video_title": "TÍTULO EXATO do trending",
      "video_url": "URL EXATA do YouTube como fornecida",
      "creator": "nome exato",
      "creator_url": "URL do canal",
      "platform": "youtube",
      "total_views": "views como fornecido",
      "momentum_score": 0-100,
      "why_relevant": "por que é relevante para nosso nicho",
      "replication_strategy": "como criar conteúdo ORIGINAL inspirado"
    }
  ],
  "top_10_ranking_mundial": [
    {
      "rank": 1,
      "video_title": "TÍTULO TRADUZIDO",
      "original_title": "título original",
      "video_url": "URL EXATA",
      "creator": "nome",
      "creator_url": "URL",
      "platform": "youtube",
      "country": "país",
      "total_views": "views",
      "momentum_score": 0-100,
      "language": "idioma",
      "why_relevant": "relevância para nicho",
      "adaptation_guide": "como adaptar para BR",
      "insight_for_brazil": "insight"
    }
  ],
  "topics": [
    {
      "topic": "slug",
      "label": "Nome",
      "reason": "baseado em qual vídeo real",
      "inspired_by_video": "título + URL do vídeo real",
      "viral_title": "Título otimizado",
      "hook": "Gancho",
      "hashtags": ["#tag1"],
      "suggested_type": "reel|carrossel|story|artigo",
      "suggested_channel": "instagram|youtube|tiktok|pinterest"
    }
  ],
  "viral_patterns": {
    "trending_hashtags": ["hashtags reais"],
    "hook_first_3_seconds": ["ganchos efetivos"],
    "best_posting_times": ["horários"]
  },
  "data_source": "youtube_trending_real",
  "data_freshness": "timestamp ISO",
  "disclaimer": "Dados de YouTube Trending. Views e rankings mudam constantemente.",
  "learnings": {
    "what_worked": [],
    "new_strategy": "",
    "evolution_note": ""
  }
}

Se NENHUM vídeo trending for relevante para o nicho, retorne arrays vazios e explique em "learnings".
Retorne APENAS JSON, sem markdown.`,
          },
          {
            role: "user",
            content: `Data: ${new Date().toISOString()}

${realVideosContext}

Analise APENAS os vídeos reais fornecidos. Filtre os relevantes para saúde mental/psicologia/comportamento.
Gere tópicos de conteúdo inspirados nos trends reais.`,
          },
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
    let rawContent = aiData.choices?.[0]?.message?.content || "{}";
    rawContent = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let analysis: any;
    try {
      analysis = JSON.parse(rawContent);
    } catch {
      console.error("Failed to parse AI response:", rawContent.slice(0, 500));
      analysis = { topics: [], top_10_ranking_brasil: [], top_10_ranking_mundial: [], viral_patterns: {}, learnings: {} };
    }

    // Validate URLs — remove any entry without a real youtube.com URL
    const validateEntries = (entries: any[]) =>
      (entries || []).filter((v: any) =>
        v.video_url && (v.video_url.includes("youtube.com/watch") || v.video_url.includes("youtu.be/"))
      );

    const competitorAnalysis = validateEntries(analysis.top_10_ranking_brasil);
    const worldRanking = validateEntries(analysis.top_10_ranking_mundial);
    const topics = analysis.topics || [];
    const viralPatterns = analysis.viral_patterns || {};
    const learnings = analysis.learnings || {};

    // Save to settings
    await supabase.from("settings").upsert({
      key: "viral_intelligence",
      value: {
        viral_patterns: viralPatterns,
        competitor_analysis: competitorAnalysis,
        world_ranking: worldRanking,
        data_source: "youtube_trending_real",
        data_freshness: new Date().toISOString(),
        disclaimer: analysis.disclaimer || "Dados reais do YouTube Trending",
        raw_trending_count: { br: brTrending.length, us: usTrending.length, gb: globalTrending.length },
        updated_at: new Date().toISOString(),
      },
    }, { onConflict: "key" });

    // Save learnings
    const prevLearningsList = ((prevLearnings?.value as any)?.history || []).slice(-49);
    const newLearning = {
      timestamp: new Date().toISOString(),
      what_worked: learnings.what_worked || [],
      new_strategy: learnings.new_strategy || "",
      evolution_note: learnings.evolution_note || "",
      real_videos_found: { br: competitorAnalysis.length, world: worldRanking.length },
    };
    prevLearningsList.push(newLearning);

    await supabase.from("settings").upsert({
      key: "brain_learnings",
      value: {
        history: prevLearningsList,
        total_iterations: prevLearningsList.length,
        last_updated: new Date().toISOString(),
        latest: newLearning,
      },
    }, { onConflict: "key" });

    // Save real video snapshots
    for (const v of [...competitorAnalysis, ...worldRanking].slice(0, 15)) {
      await supabase.from("video_snapshots").insert({
        video_title: v.video_title || v.original_title || "",
        creator: v.creator || "",
        platform: v.platform || "youtube",
        region: v.country || "brasil",
        total_views: v.total_views || "",
        momentum_score: v.momentum_score || 0,
        metadata: { video_url: v.video_url, source: "youtube_trending_real" },
      });
    }

    // Log
    await supabase.from("system_logs").insert({
      event_type: "pesquisa",
      message: `📊 Pesquisa REAL: ${brTrending.length} trending BR, ${usTrending.length} trending US — ${competitorAnalysis.length} relevantes BR, ${worldRanking.length} relevantes mundo`,
      level: "info",
      metadata: {
        source: "youtube_trending_real",
        topics_count: topics.length,
        br_relevant: competitorAnalysis.length,
        world_relevant: worldRanking.length,
      },
    });

    return new Response(JSON.stringify({
      topics,
      viral_patterns: viralPatterns,
      competitor_analysis: competitorAnalysis,
      world_ranking: worldRanking,
      data_source: "youtube_trending_real",
      learnings,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("research-trends error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
