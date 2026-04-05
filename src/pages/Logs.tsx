import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, FileText, FlaskConical, Shield, Send, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  icon: typeof Brain;
  level: "info" | "success" | "warning" | "error";
  message: string;
}

const logs: LogEntry[] = [
  { id: "1", timestamp: "14:32:01", agent: "Brain Agent", icon: Brain, level: "info", message: "Ciclo diário iniciado. Analisando métricas..." },
  { id: "2", timestamp: "14:32:05", agent: "Brain Agent", icon: Brain, level: "success", message: "3 temas selecionados: ansiedade, relacionamentos, trauma" },
  { id: "3", timestamp: "14:32:12", agent: "Content Agent", icon: FileText, level: "info", message: "Gerando conteúdo para tema: ansiedade (Reel)" },
  { id: "4", timestamp: "14:32:28", agent: "Content Agent", icon: FileText, level: "success", message: "Conteúdo gerado com sucesso. Tokens: 847" },
  { id: "5", timestamp: "14:32:30", agent: "Science Agent", icon: FlaskConical, level: "info", message: "Validando base científica..." },
  { id: "6", timestamp: "14:32:33", agent: "Science Agent", icon: FlaskConical, level: "success", message: "Referência encontrada: Frontiers in Psychology (2023)" },
  { id: "7", timestamp: "14:32:35", agent: "Ethics Agent", icon: Shield, level: "info", message: "Verificando conformidade ética (CRP)..." },
  { id: "8", timestamp: "14:32:36", agent: "Ethics Agent", icon: Shield, level: "success", message: "Aprovado. Nenhuma violação detectada." },
  { id: "9", timestamp: "14:32:40", agent: "Content Agent", icon: FileText, level: "info", message: "Gerando conteúdo para tema: relacionamentos (Carousel)" },
  { id: "10", timestamp: "14:32:58", agent: "Ethics Agent", icon: Shield, level: "warning", message: "Conteúdo sobre trauma revisado: termo 'cura garantida' removido" },
  { id: "11", timestamp: "14:33:02", agent: "Brain Agent", icon: Brain, level: "info", message: "Score calculado: ansiedade=91, relacionamentos=88, trauma=78" },
  { id: "12", timestamp: "14:33:10", agent: "Instagram", icon: Send, level: "success", message: "Post publicado com sucesso. ID: 17923847562" },
  { id: "13", timestamp: "14:33:15", agent: "Brain Agent", icon: Brain, level: "success", message: "Ciclo completo. Próximo: 15:32:01" },
];

const levelConfig = {
  info: { color: "text-info", bg: "bg-info/10", icon: Brain },
  success: { color: "text-success", bg: "bg-success/10", icon: CheckCircle2 },
  warning: { color: "text-warning", bg: "bg-warning/10", icon: AlertTriangle },
  error: { color: "text-destructive", bg: "bg-destructive/10", icon: XCircle },
};

export default function LogsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Logs do Sistema</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe a execução dos agentes em tempo real
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="font-heading text-lg">Execução Recente</CardTitle>
            <Badge variant="outline" className="text-xs">
              Último ciclo: 14:32 — 14:33
            </Badge>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-1">
                {logs.map((log) => {
                  const config = levelConfig[log.level];
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-muted/50 animate-fade-in"
                    >
                      <span className="text-[10px] text-muted-foreground font-mono mt-0.5 shrink-0 w-14">
                        {log.timestamp}
                      </span>
                      <div className={`rounded p-1 shrink-0 ${config.bg}`}>
                        <log.icon className={`h-3 w-3 ${config.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {log.agent}
                        </span>
                        <p className="text-sm">{log.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
