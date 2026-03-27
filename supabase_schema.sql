-- @joaopaulosico Workspace — Supabase Schema
-- Execute no SQL Editor do Supabase

-- Brand context (singleton por usuário)
CREATE TABLE IF NOT EXISTS brand_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  handle text DEFAULT '@joaopaulosico',
  arquetipo text DEFAULT 'Estrategista Impetuoso',
  publico_alvo text,
  proposta_valor text,
  voz_marca text,
  frases_permitidas text[] DEFAULT ARRAY[]::text[],
  frases_proibidas text[] DEFAULT ARRAY[]::text[],
  palavras_proibidas text[] DEFAULT ARRAY[]::text[],
  emojis_permitidos text[] DEFAULT ARRAY['🎯','⚡','🧠','🔥','📌','👇','✅','🎬'],
  emojis_proibidos text[] DEFAULT ARRAY['🙌','💫','✨','🌟','💪'],
  produtos jsonb DEFAULT '[]',
  hashtags_core text[] DEFAULT ARRAY['#empreendedorcriativo','#marcapessoal','#posicionamento'],
  score_atual numeric DEFAULT 7.1,
  meta_90d numeric DEFAULT 8.5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Pilares editoriais
CREATE TABLE IF NOT EXISTS editorial_pillars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  nome text NOT NULL,
  cor text NOT NULL,
  descricao text,
  objetivo text,
  meta_frequencia integer DEFAULT 1,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Séries de conteúdo
CREATE TABLE IF NOT EXISTS content_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  nome text NOT NULL,
  descricao text,
  pillar_id uuid REFERENCES editorial_pillars,
  total_episodios integer DEFAULT 0,
  status text DEFAULT 'ativa',
  created_at timestamptz DEFAULT now()
);

-- Histórico de conteúdo gerado
CREATE TABLE IF NOT EXISTS generated_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  tipo text NOT NULL,
  titulo text,
  serie_id uuid REFERENCES content_series,
  pillar_id uuid REFERENCES editorial_pillars,
  episodio_numero integer,
  input_prompt text,
  output_content jsonb NOT NULL DEFAULT '{}',
  quality_score integer,
  quality_flags jsonb,
  status text DEFAULT 'draft',
  plataforma text,
  tokens_used integer,
  starred boolean DEFAULT false,
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

-- Banco de pautas
CREATE TABLE IF NOT EXISTS content_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  titulo text NOT NULL,
  angulo text,
  formato text,
  serie_id uuid REFERENCES content_series,
  pillar_id uuid REFERENCES editorial_pillars,
  origem text DEFAULT 'manual',
  status text DEFAULT 'backlog',
  prioridade integer DEFAULT 3,
  hook_principal text,
  modelo_hook text,
  notas text,
  data_sugerida date,
  created_at timestamptz DEFAULT now()
);

-- Calendário editorial
CREATE TABLE IF NOT EXISTS content_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  idea_id uuid REFERENCES content_ideas,
  content_id uuid REFERENCES generated_content,
  titulo text,
  plataforma text,
  formato text,
  pillar_id uuid REFERENCES editorial_pillars,
  data_publicacao date NOT NULL,
  horario time,
  status text DEFAULT 'planejado',
  notas text,
  created_at timestamptz DEFAULT now()
);

-- Métricas
CREATE TABLE IF NOT EXISTS content_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  content_id uuid REFERENCES generated_content,
  plataforma text,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  comentarios integer DEFAULT 0,
  compartilhamentos integer DEFAULT 0,
  salvamentos integer DEFAULT 0,
  dms_gerados integer DEFAULT 0,
  vendas_atribuidas integer DEFAULT 0,
  data_registro date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Hooks library
CREATE TABLE IF NOT EXISTS hooks_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  texto_tela text NOT NULL,
  texto_falado text,
  modelo text NOT NULL,
  intencao text,
  tema text,
  pillar_id uuid REFERENCES editorial_pillars,
  performance_score integer,
  starred boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Templates
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  nome text NOT NULL,
  tipo text NOT NULL,
  serie_referencia text,
  estrutura jsonb NOT NULL,
  descricao text,
  uso_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS policies
ALTER TABLE brand_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE hooks_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Universal policy (repita para cada tabela)
DO $$ DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['brand_context','editorial_pillars','content_series','generated_content','content_ideas','content_calendar','content_metrics','hooks_library','templates']
  LOOP
    EXECUTE format('CREATE POLICY IF NOT EXISTS "users_own_data_%s" ON %s FOR ALL USING (auth.uid() = user_id)', tbl, tbl);
  END LOOP;
END $$;

-- Trigger updated_at para brand_context
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brand_context_updated_at
  BEFORE UPDATE ON brand_context
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
