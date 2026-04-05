import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Instagram, Youtube, MessageCircle, Music2, ExternalLink, Settings } from "lucide-react";

const channels = [
  {
    name: "Instagram",
    icon: Instagram,
    connected: true,
    enabled: true,
    followers: "12.4K",
    postsThisWeek: 8,
    engagement: "4.2%",
    color: "from-pink-500 to-orange-400",
  },
  {
    name: "YouTube",
    icon: Youtube,
    connected: true,
    enabled: true,
    followers: "3.2K",
    postsThisWeek: 3,
    engagement: "6.8%",
    color: "from-red-500 to-red-600",
  },
  {
    name: "TikTok",
    icon: Music2,
    connected: false,
    enabled: false,
    followers: "—",
    postsThisWeek: 0,
    engagement: "—",
    color: "from-gray-600 to-gray-700",
  },
  {
    name: "WhatsApp",
    icon: MessageCircle,
    connected: false,
    enabled: false,
    followers: "—",
    postsThisWeek: 0,
    engagement: "—",
    color: "from-green-500 to-green-600",
  },
];

export default function ChannelsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Canais</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie suas integrações com redes sociais
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((ch) => (
            <Card key={ch.name} className={`animate-fade-in ${ch.connected ? "hover:glow-primary" : "opacity-70"} transition-all`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2.5 bg-gradient-to-br ${ch.color}`}>
                      <ch.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="font-heading text-base">{ch.name}</CardTitle>
                      <Badge variant={ch.connected ? "default" : "secondary"} className="text-[10px] mt-1">
                        {ch.connected ? "Conectado" : "Desconectado"}
                      </Badge>
                    </div>
                  </div>
                  <Switch checked={ch.enabled} disabled={!ch.connected} />
                </div>
              </CardHeader>
              <CardContent>
                {ch.connected ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-lg font-heading font-bold">{ch.followers}</p>
                      <p className="text-[10px] text-muted-foreground">Seguidores</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-heading font-bold">{ch.postsThisWeek}</p>
                      <p className="text-[10px] text-muted-foreground">Posts/Semana</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-heading font-bold">{ch.engagement}</p>
                      <p className="text-[10px] text-muted-foreground">Engajamento</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-sm text-muted-foreground mb-3">Conecte sua conta para ativar</p>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Conectar API
                    </Button>
                  </div>
                )}
                {ch.connected && (
                  <Button size="sm" variant="ghost" className="w-full mt-3 text-xs">
                    <Settings className="h-3 w-3 mr-1" /> Configurar
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
