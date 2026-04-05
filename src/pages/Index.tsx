import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { ContentQueue } from "@/components/ContentQueue";
import { PerformanceChart } from "@/components/PerformanceChart";
import { AgentStatus } from "@/components/AgentStatus";
import { TopicsRanking } from "@/components/TopicsRanking";
import { Eye, Heart, Share2, Users, Zap, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral do sistema autônomo
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Views Totais"
            value="14.950"
            change="+23% vs semana anterior"
            changeType="positive"
            icon={Eye}
            iconColor="bg-primary/10 text-primary"
          />
          <MetricCard
            title="Saves"
            value="1.002"
            change="+15% vs semana anterior"
            changeType="positive"
            icon={Heart}
            iconColor="bg-accent/10 text-accent"
          />
          <MetricCard
            title="Compartilhamentos"
            value="425"
            change="+8% vs semana anterior"
            changeType="positive"
            icon={Share2}
            iconColor="bg-info/10 text-info"
          />
          <MetricCard
            title="Leads Gerados"
            value="47"
            change="+31% vs semana anterior"
            changeType="positive"
            icon={Users}
            iconColor="bg-success/10 text-success"
          />
          <MetricCard
            title="Score Médio"
            value="82.4"
            change="+5 pontos"
            changeType="positive"
            icon={TrendingUp}
            iconColor="bg-warning/10 text-warning"
          />
          <MetricCard
            title="Posts Publicados"
            value="18"
            change="3 pendentes"
            changeType="neutral"
            icon={Zap}
            iconColor="bg-primary/10 text-primary"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PerformanceChart />
          <AgentStatus />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ContentQueue />
          <TopicsRanking />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
