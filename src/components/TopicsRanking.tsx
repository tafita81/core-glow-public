import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const topicLabels: Record<string, string> = {
  ansiedade: "Ansiedade",
  relacionamentos: "Relacionamentos",
  trauma: "Trauma & PTSD",
  autoestima: "Autoestima",
  burnout: "Burnout",
  "inteligencia-emocional": "Inteligência Emocional",
};

export function TopicsRanking() {
  const { data: contents, isLoading } = useQuery({
    queryKey: ["topics-ranking"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contents").select("topic, score");
      if (error) throw error;
      return data;
    },
  });

  const topicStats = contents?.reduce((acc, c) => {
    const t = c.topic || "outro";
    if (!acc[t]) acc[t] = { total: 0, count: 0 };
    acc[t].total += c.score ?? 0;
    acc[t].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>) ?? {};

  const topics = Object.entries(topicStats)
    .map(([key, val]) => ({
      name: topicLabels[key] || key,
      score: Math.round(val.total / val.count),
      posts: val.count,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg">Ranking de Temas</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (topics.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg">Ranking de Temas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">Gere conteúdos para ver o ranking</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg">Ranking de Temas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {topics.map((topic, i) => (
          <div key={topic.name} className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground w-5 text-right">
              #{i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium truncate">{topic.name}</span>
                <div className="flex items-center gap-1">
                  {topic.score >= 75 ? (
                    <TrendingUp className="h-3 w-3 text-success" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                  <span className="text-xs font-bold">{topic.score}</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-primary transition-all duration-700"
                  style={{ width: `${topic.score}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
