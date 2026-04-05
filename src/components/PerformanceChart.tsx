import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function PerformanceChart() {
  const { data: contents, isLoading } = useQuery({
    queryKey: ["performance-chart"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data, error } = await supabase
        .from("contents")
        .select("created_at, score, status")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Group by day of week
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayKey = d.toISOString().slice(0, 10);
    const dayContents = contents?.filter(
      (c) => c.created_at.slice(0, 10) === dayKey
    ) ?? [];
    return {
      day: dayNames[d.getDay()],
      count: dayContents.length,
      avgScore: dayContents.length
        ? Math.round(dayContents.reduce((a, b) => a + (b.score ?? 0), 0) / dayContents.length)
        : 0,
      published: dayContents.filter((c) => c.status === "publicado").length,
    };
  });

  const maxCount = Math.max(...weekData.map((d) => d.count), 1);
  const totalGenerated = weekData.reduce((a, b) => a + b.count, 0);
  const totalPublished = weekData.reduce((a, b) => a + b.published, 0);
  const avgScore = totalGenerated
    ? Math.round(weekData.reduce((a, b) => a + b.avgScore * b.count, 0) / totalGenerated)
    : 0;

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg">Performance Semanal</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="font-heading text-lg">Performance Semanal</CardTitle>
        <Badge variant="secondary" className="text-xs">Últimos 7 dias</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-40">
          {weekData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground font-medium">
                {d.count}
              </span>
              <div
                className="w-full rounded-t-md bg-gradient-primary transition-all duration-500 hover:opacity-80"
                style={{
                  height: `${Math.max((d.count / maxCount) * 100, 4)}%`,
                }}
              />
              <span className="text-[10px] text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-lg font-heading font-bold">{totalGenerated}</p>
            <p className="text-[10px] text-muted-foreground">Gerados</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-heading font-bold">{totalPublished}</p>
            <p className="text-[10px] text-muted-foreground">Publicados</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-heading font-bold">{avgScore}</p>
            <p className="text-[10px] text-muted-foreground">Score Médio</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
