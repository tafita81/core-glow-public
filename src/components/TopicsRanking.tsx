import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

const topics = [
  { name: "Ansiedade", score: 94, trend: "up", posts: 12 },
  { name: "Relacionamentos Tóxicos", score: 89, trend: "up", posts: 8 },
  { name: "Trauma & PTSD", score: 82, trend: "up", posts: 6 },
  { name: "Autoestima", score: 76, trend: "down", posts: 10 },
  { name: "Inteligência Emocional", score: 71, trend: "up", posts: 4 },
  { name: "Burnout", score: 68, trend: "down", posts: 5 },
];

export function TopicsRanking() {
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
                  {topic.trend === "up" ? (
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
