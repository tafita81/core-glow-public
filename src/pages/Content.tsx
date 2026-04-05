import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Sparkles, FlaskConical, Shield, Send, RefreshCw } from "lucide-react";
import { useState } from "react";

const generatedContent = [
  {
    id: "1",
    topic: "Ansiedade",
    channel: "Instagram",
    type: "Reel",
    content: "🧠 5 sinais de que sua ansiedade está controlando suas decisões — e você nem percebe.\n\n1️⃣ Você evita conversas importantes\n2️⃣ Procrastina por medo de errar\n3️⃣ Diz 'sim' pra tudo pra evitar conflito\n4️⃣ Checa o celular compulsivamente\n5️⃣ Interpreta silêncio como rejeição\n\n📚 Base científica: Segundo estudo publicado na Frontiers in Psychology (2023), a ansiedade altera os circuitos de tomada de decisão no córtex pré-frontal.\n\n💬 Qual desses sinais você mais se identifica? Comenta aqui 👇\n\n#psicologia #ansiedade #saudemental #autoconhecimento",
    scienceValidated: true,
    ethicsValidated: true,
    score: 91,
  },
  {
    id: "2",
    topic: "Relacionamentos",
    channel: "Instagram",
    type: "Carousel",
    content: "🔁 O padrão tóxico que você repete nos relacionamentos — sem perceber.\n\nSlide 1: Você atrai sempre o mesmo tipo de pessoa?\nSlide 2: Teoria do Apego — Bowlby explica por quê\nSlide 3: Apego Ansioso vs Apego Evitativo\nSlide 4: Como identificar seu padrão\nSlide 5: CTA — Salva esse post pra ler quando precisar\n\n📚 Base científica: Hazan & Shaver (1987) — Romantic Love as Attachment Process, Journal of Personality and Social Psychology.",
    scienceValidated: true,
    ethicsValidated: true,
    score: 88,
  },
];

export default function ContentPage() {
  const [topic, setTopic] = useState("");
  const [channel, setChannel] = useState("");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Geração de Conteúdo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gere, valide e aprove conteúdo automaticamente
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Gerar Novo Conteúdo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tema</label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ansiedade">Ansiedade</SelectItem>
                    <SelectItem value="relacionamentos">Relacionamentos</SelectItem>
                    <SelectItem value="trauma">Trauma & PTSD</SelectItem>
                    <SelectItem value="autoestima">Autoestima</SelectItem>
                    <SelectItem value="burnout">Burnout</SelectItem>
                    <SelectItem value="inteligencia-emocional">Inteligência Emocional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Canal</label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Textarea placeholder="Instruções adicionais (opcional)..." className="min-h-[80px]" />
            <Button className="bg-gradient-primary text-primary-foreground">
              <Brain className="h-4 w-4 mr-2" />
              Gerar com IA
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="font-heading text-lg font-semibold">Conteúdo Gerado</h2>
          {generatedContent.map((item) => (
            <Card key={item.id} className="hover:glow-primary transition-shadow">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{item.channel}</Badge>
                  <Badge variant="outline">{item.type}</Badge>
                  <Badge variant="outline">{item.topic}</Badge>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Score:</span>
                    <span className="text-sm font-bold text-success">{item.score}</span>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <pre className="text-sm whitespace-pre-wrap font-sans">{item.content}</pre>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <FlaskConical className={`h-4 w-4 ${item.scienceValidated ? "text-success" : "text-destructive"}`} />
                    <span className="text-xs">Ciência {item.scienceValidated ? "✓" : "✗"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className={`h-4 w-4 ${item.ethicsValidated ? "text-success" : "text-destructive"}`} />
                    <span className="text-xs">Ética {item.ethicsValidated ? "✓" : "✗"}</span>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Button size="sm" variant="outline">
                      <RefreshCw className="h-3 w-3 mr-1" /> Regenerar
                    </Button>
                    <Button size="sm" className="bg-gradient-primary text-primary-foreground">
                      <Send className="h-3 w-3 mr-1" /> Publicar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
