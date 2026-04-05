import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const weekData = [
  { day: "Seg", views: 1200, saves: 89, shares: 34 },
  { day: "Ter", views: 1800, saves: 124, shares: 56 },
  { day: "Qua", views: 950, saves: 67, shares: 23 },
  { day: "Qui", views: 2400, saves: 178, shares: 78 },
  { day: "Sex", views: 3200, saves: 234, shares: 102 },
  { day: "Sáb", views: 2800, saves: 198, shares: 87 },
  { day: "Dom", views: 1600, saves: 112, shares: 45 },
];

const maxViews = Math.max(...weekData.map((d) => d.views));

export function PerformanceChart() {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="font-heading text-lg">Performance Semanal</CardTitle>
        <Badge variant="secondary" className="text-xs">Últimos 7 dias</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-40">
          {weekData.map((d, i) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground font-medium">
                {d.views.toLocaleString()}
              </span>
              <div
                className="w-full rounded-t-md bg-gradient-primary transition-all duration-500 hover:opacity-80"
                style={{
                  height: `${(d.views / maxViews) * 100}%`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
              <span className="text-[10px] text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-lg font-heading font-bold">
              {weekData.reduce((a, b) => a + b.views, 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">Views Total</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-heading font-bold">
              {weekData.reduce((a, b) => a + b.saves, 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">Saves Total</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-heading font-bold">
              {weekData.reduce((a, b) => a + b.shares, 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">Shares Total</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
