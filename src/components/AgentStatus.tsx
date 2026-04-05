import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  FileText,
  FlaskConical,
  Shield,
  Instagram,
  Youtube,
  MessageCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const agentDefs = [
  { name: "Brain Agent", icon: Brain, eventType: "sistema" },
  { name: "Content Agent", icon: FileText, eventType: "geracao" },
  { name: "Science Agent", icon: FlaskConical, eventType: "validacao" },
  { name: "Ethics Agent", icon: Shield, eventType: "validacao" },
  { name: "Instagram", icon: Instagram, eventType: "publicacao" },
  { name: "YouTube", icon: Youtube, eventType: "publicacao" },
];

const statusConfig = {
  active: { label: "Ativo", color: "bg-success" },
  waiting: { label: "Aguardando", color: "bg-warning" },
  inactive: { label: "Inativo", color: "bg-muted-foreground" },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins} min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

export function AgentStatus() {
  const { data: logs } = useQuery({
    queryKey: ["agent-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  const agents = agentDefs.map((agent) => {
    const lastLog = logs?.find((l) => l.event_type === agent.eventType);
    const hasRecent = lastLog && (Date.now() - new Date(lastLog.created_at).getTime()) < 3600000;
    return {
      ...agent,
      status: hasRecent ? "active" : lastLog ? "waiting" : "inactive",
      lastRun: lastLog ? timeAgo(lastLog.created_at) : "Sem atividade",
    };
  });

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
