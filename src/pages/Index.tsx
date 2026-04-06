import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { ContentQueue } from "@/components/ContentQueue";
import { PerformanceChart } from "@/components/PerformanceChart";
import { AgentStatus } from "@/components/AgentStatus";
import { TopicsRanking } from "@/components/TopicsRanking";
import { PendingActions } from "@/components/PendingActions";
import { VideoRankingCard } from "@/components/VideoRankingCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Zap, TrendingUp, Target, Users, DollarSign, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { data: contents } = useQuery({
    queryKey: ["dashboard-contents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contents").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: viralIntel } = useQuery({
    queryKey: ["viral-intelligence"],
    queryFn: async () => {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "viral_intelligence")
        .single();
      return data?.value as any;
    },
  });

  const published = contents?.filter((c) => c.status === "publicado").length ?? 0;
  const pending = contents?.filter((c) => c.status !== "publicado" && c.status !== "rejeitado").length ?? 0;
  const avgScore = contents?.length
    ? Math.round(contents.reduce((a, b) => a + (b.score ?? 0), 0) / contents.length)
    : 0;
  const viralReady = contents?.filter((c) => (c.score ?? 0) >= 85).length ?? 0;

  const topVideosBrasil = viralIntel?.top_10_ranking_brasil || viralIntel?.competitor_analysis || [];
  const topVideosMundial = viralIntel?.world_ranking || [];
  const monetization = viralIntel?.monetization_insights || {};
  const patterns = viralIntel?.viral_patterns || {};
  const momentum = viralIntel?.momentum_analysis || {};
  const redditTrending = viralIntel?.reddit_trending || [];
  const newsTrending = viralIntel?.news_trending || [];
  const dataSources = viralIntel?.data_sources || [];
  const rankingCriteria = viralIntel?.ranking_criteria || {};

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Dashboard Viral</h1>
            <p className="text-sm text-muted-foreground mt-1">
              🧠 Cérebro VIRAL autônomo — análise de concorrentes + monetização 24/7
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] animate-pulse-glow">
            🔥 Modo Viral Ativo
          </Badge>
        </div>

        <Link to="/strategy">
          <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20 hover:border-primary/40 transition-all cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading text-sm font-semibold">Entenda a Estratégia do Cérebro</h3>
                <p className="text-[11px] text-muted-foreground">Veja como cada etapa funciona em tempo real — explicação simples e didática</p>
              </div>
              <TrendingUp className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform shrink-0" />
            </CardContent>
          </Card>
        </Link>

        <PendingActions />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard
            title="Gerados"
            value={String(contents?.length ?? 0)}
            change="Total"
            changeType="neutral"
            icon={Eye}
            iconColor="bg-primary/10 text-primary"
          />
          <MetricCard
            title="Publicados"
            value={String(published)}
            change={`${pending} pendentes`}
            changeType="positive"
            icon={Zap}
            iconColor="bg-success/10 text-success"
          />
          <MetricCard
            title="Score Médio"
            value={String(avgScore)}
            change={avgScore >= 85 ? "🔥 Viral" : avgScore >= 75 ? "✓ Bom" : "↑ Melhorar"}
            changeType={avgScore >= 75 ? "positive" : "negative"}
            icon={TrendingUp}
            iconColor="bg-warning/10 text-warning"
          />
          <MetricCard
            title="Viral-Ready"
            value={String(viralReady)}
            change="Score ≥ 85"
            changeType="positive"
            icon={Target}
            iconColor="bg-destructive/10 text-destructive"
          />
          <MetricCard
            title="Vídeos Virais"
            value={String(topVideosBrasil.length)}
            change="Rankeados"
            changeType="neutral"
            icon={Users}
            iconColor="bg-accent/50 text-accent-foreground"
          />
          <MetricCard
            title="Hashtags"
            value={String((patterns.trending_hashtags || []).length)}
            change="Trending"
            changeType="positive"
            icon={DollarSign}
            iconColor="bg-primary/10 text-primary"
          />
        </div>

        {(topVideosMundial.length > 0 || topVideosBrasil.length > 0 || (monetization.revenue_streams || []).length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <VideoRankingCard
              title="🌍 Top Vídeos Mundial — Psicologia"
              priorityBadge="⭐ Prioridade"
              videos={topVideosMundial}
              maxVideos={15}
              updatedAt={viralIntel?.updated_at}
              rankingInfo={rankingCriteria}
            />
            <VideoRankingCard
              title="🇧🇷 Top Vídeos Brasil — Psicologia"
              videos={topVideosBrasil}
              maxVideos={10}
              updatedAt={viralIntel?.updated_at}
              rankingInfo={rankingCriteria}
            />
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  💰 Estratégias de Monetização
                  {monetization.avg_viral_score > 0 && (
                    <Badge variant="secondary" className="text-[9px]">
                      Viral Score Médio: {monetization.avg_viral_score > 1000000 ? `${(monetization.avg_viral_score / 1000000).toFixed(1)}M` : monetization.avg_viral_score > 1000 ? `${(monetization.avg_viral_score / 1000).toFixed(0)}K` : monetization.avg_viral_score}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {monetization.best_format && (
                  <div className="flex items-center gap-2 text-xs bg-primary/5 rounded-md p-2">
                    <span>🏆</span>
                    <span className="font-medium">Formato mais viral: {monetization.best_format}</span>
                  </div>
                )}
                {monetization.best_hook_pattern && (
                  <div className="flex items-center gap-2 text-xs bg-primary/5 rounded-md p-2">
                    <span>🎯</span>
                    <span className="font-medium">Hook mais eficaz: {monetization.best_hook_pattern}</span>
                  </div>
                )}
                {monetization.ideal_duration && (
                  <div className="flex items-center gap-2 text-xs bg-primary/5 rounded-md p-2">
                    <span>⏳</span>
                    <span className="font-medium">Duração ideal: {monetization.ideal_duration}</span>
                  </div>
                )}
                {(monetization.revenue_streams || []).map((stream: string, i: number) => (
                  <div key={`rev-${i}`} className="flex items-center gap-2 text-xs">
                    <span className="text-success">💵</span>
                    <span>{stream}</span>
                  </div>
                ))}
                {(monetization.community_growth_tactics || []).map((tactic: string, i: number) => (
                  <div key={`tac-${i}`} className="flex items-center gap-2 text-xs">
                    <span>📈</span>
                    <span>{tactic}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
        {/* Momentum Analysis */}
        {(momentum.hottest_video_now || momentum.fastest_growing_topic || (momentum.emerging_trends || momentum.emerging_videos || []).length > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">⚡ Análise de Momentum em Tempo Real</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(momentum.hottest_video_now || momentum.fastest_growing_topic) && (
                <div className="text-xs">
                  <span className="font-medium text-success">🚀 Vídeo mais quente agora:</span>{" "}
                  <span>{momentum.hottest_video_now || momentum.fastest_growing_topic}</span>
                </div>
              )}
              {momentum.best_time_to_post && (
                <div className="text-xs">
                  <span className="font-medium text-primary">⏰ Melhor horário para postar:</span>{" "}
                  <span>{momentum.best_time_to_post}</span>
                </div>
              )}
              {(momentum.emerging_trends || []).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-success mb-1">🌱 Tendências EMERGENTES (máxima oportunidade):</p>
                  <div className="flex flex-wrap gap-1">
                    {(momentum.emerging_trends || []).map((t: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-[10px] bg-success/10 text-success">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(momentum.dying_trends || []).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-destructive mb-1">💀 Tendências MORRENDO (evitar):</p>
                  <div className="flex flex-wrap gap-1">
                    {(momentum.dying_trends || []).map((t: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-[10px] bg-destructive/10 text-destructive">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reddit & News */}
        {(redditTrending.length > 0 || newsTrending.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {redditTrending.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">🟠 Reddit — Trending em Psicologia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {redditTrending.slice(0, 8).map((p: any, i: number) => (
                    <div
                      key={i}
                      onClick={() => window.open(p.url, "_blank")}
                      className="flex items-start gap-2 text-xs hover:bg-muted/50 rounded-md p-1.5 -mx-1.5 cursor-pointer"
                    >
                      <span className="font-bold text-primary min-w-[20px]">⬆{p.score}</span>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{p.title}</p>
                        <p className="text-[10px] text-muted-foreground">r/{p.subreddit} • {p.comments} comentários</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {newsTrending.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">📰 Notícias — Saúde Mental</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {newsTrending.slice(0, 8).map((n: any, i: number) => (
                    <div
                      key={i}
                      onClick={() => window.open(n.url, "_blank")}
                      className="flex items-start gap-2 text-xs hover:bg-muted/50 rounded-md p-1.5 -mx-1.5 cursor-pointer"
                    >
                      <span className="text-primary">📄</span>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{n.title}</p>
                        <p className="text-[10px] text-muted-foreground">{n.source}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Data Sources Status */}
        {dataSources.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-muted-foreground">Fontes ativas:</span>
            {dataSources.map((s: string) => (
              <Badge key={s} variant="outline" className="text-[9px]">✅ {s}</Badge>
            ))}
          </div>
        )}

        {(patterns.trending_hashtags || []).length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium"># Hashtags Trending Agora</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {(patterns.trending_hashtags || []).map((tag: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PerformanceChart />
          <AgentStatus />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ContentQueue />
          <TopicsRanking />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
