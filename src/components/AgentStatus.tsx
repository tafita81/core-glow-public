import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  FileText,
  FlaskConical,
  Shield,
  Instagram,
  Youtube,
  MessageCircle,
} from "lucide-react";

const agents = [
  { name: "Brain Agent", icon: Brain, status: "active", lastRun: "3 min atrás" },
  { name: "Content Agent", icon: FileText, status: "active", lastRun: "5 min atrás" },
  { name: "Science Agent", icon: FlaskConical, status: "active", lastRun: "5 min atrás" },
  { name: "Ethics Agent", icon: Shield, status: "active", lastRun: "5 min atrás" },
  { name: "Instagram", icon: Instagram, status: "waiting", lastRun: "1h atrás" },
  { name: "YouTube", icon: Youtube, status: "active", lastRun: "2h atrás" },
  { name: "WhatsApp", icon: MessageCircle, status: "inactive", lastRun: "Desativado" },
];

const statusConfig = {
  active: { label: "Ativo", color: "bg-success" },
  waiting: { label: "Aguardando", color: "bg-warning" },
  inactive: { label: "Inativo", color: "bg-muted-foreground" },
};

export function AgentStatus() {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg">Status dos Agentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {agents.map((agent) => {
          const config = statusConfig[agent.status as keyof typeof statusConfig];
          return (
            <div
              key={agent.name}
              className="flex items-center gap-3 rounded-lg border p-2.5 transition-colors hover:bg-muted/50"
            >
              <div className="rounded-lg bg-muted p-2">
                <agent.icon className="h-4 w-4 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{agent.name}</p>
                <p className="text-[10px] text-muted-foreground">{agent.lastRun}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${config.color}`} />
                <span className="text-[10px] text-muted-foreground">{config.label}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
