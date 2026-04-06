
CREATE TABLE public.performance_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  video_url TEXT,
  title TEXT NOT NULL,
  views_24h BIGINT DEFAULT 0,
  views_48h BIGINT DEFAULT 0,
  views_7d BIGINT DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  followers_gained INTEGER DEFAULT 0,
  revenue_estimated NUMERIC DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  content_format TEXT,
  hook_pattern TEXT,
  duration_sec INTEGER DEFAULT 0,
  posted_at TIMESTAMP WITH TIME ZONE,
  topic TEXT,
  language TEXT DEFAULT 'pt',
  learned_insights JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.performance_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to performance_history"
ON public.performance_history
FOR ALL
USING (true)
WITH CHECK (true);

CREATE TRIGGER update_performance_history_updated_at
BEFORE UPDATE ON public.performance_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
