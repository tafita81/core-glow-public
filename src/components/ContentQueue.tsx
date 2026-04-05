import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Clock, Eye } from "lucide-react";

interface ContentItem {
  id: string;
  topic: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  channel: string;
  preview: string;
  score: number;
}

const mockContent: ContentItem[] = [
  {
    id: "1",
    topic: "Ansiedade",
    type: "Reel",
    status: "pending",
    channel: "Instagram",
    preview: "5 sinais de que sua ansiedade está controlando você — e o que a ciência diz sobre isso...",
    score: 87,
  },
  {
    id: "2",
    topic: "Relacionamentos",
    type: "Carousel",
    status: "pending",
    channel: "Instagram",
    preview: "O padrão tóxico que você repete sem perceber. Baseado em Frontiers in Psychology...",
    score: 92,
  },
  {
    id: "3",
    topic: "Trauma",
    type: "Short",
    status: "approved",
    channel: "YouTube",
    preview: "Por que você congela em situações de estresse? A neurociência explica...",
    score: 78,
  },
  {
    id: "4",
    topic: "Autoestima",
    type: "Reel",
    status: "rejected",
    channel: "TikTok",
    preview: "3 hábitos que destroem sua autoestima silenciosamente...",
    score: 65,
  },
];

const statusConfig = {
  pending: { label: "Pendente", variant: "outline" as const, icon: Clock },
  approved: { label: "Aprovado", variant: "default" as const, icon: Check },
  rejected: { label: "Rejeitado", variant: "destructive" as const, icon: X },
};

export function ContentQueue() {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="font-heading text-lg">Fila de Conteúdo</CardTitle>
        <Badge variant="secondary" className="text-xs">
          {mockContent.filter((c) => c.status === "pending").length} pendentes
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockContent.map((item) => {
          const config = statusConfig[item.status];
          return (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {item.channel}
                  </Badge>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {item.type}
                  </Badge>
                  <span className="text-sm font-medium truncate">
                    {item.topic}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-muted-foreground">Score:</span>
                  <span
                    className={`text-xs font-bold ${
                      item.score >= 80
                        ? "text-success"
                        : item.score >= 60
                        ? "text-warning"
                        : "text-destructive"
                    }`}
                  >
                    {item.score}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {item.preview}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant={config.variant} className="text-[10px]">
                  <config.icon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
                {item.status === "pending" && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                      <Eye className="h-3 w-3 mr-1" /> Ver
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-success hover:text-success">
                      <Check className="h-3 w-3 mr-1" /> Aprovar
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive hover:text-destructive">
                      <X className="h-3 w-3 mr-1" /> Rejeitar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
