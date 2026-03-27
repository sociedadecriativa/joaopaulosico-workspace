export interface BrandContext {
  id: string
  user_id: string
  handle: string
  arquetipo: string
  publico_alvo: string
  proposta_valor: string
  voz_marca: string
  frases_permitidas: string[]
  frases_proibidas: string[]
  palavras_proibidas: string[]
  emojis_permitidos: string[]
  emojis_proibidos: string[]
  produtos: Produto[]
  hashtags_core: string[]
  score_atual: number
  meta_90d: number
  created_at: string
  updated_at: string
}

export interface Produto {
  nome: string
  preco: string
  link_kiwify: string
  descricao: string
  tipo: 'essencial' | 'premium'
}

export interface EditorialPillar {
  id: string
  user_id: string
  nome: 'VOLTAGEM' | 'MATERIA' | 'METODO' | 'SINAL'
  cor: string
  descricao: string
  objetivo: 'alcance' | 'autoridade' | 'educacao' | 'conversao'
  meta_frequencia: number
  ativo: boolean
  created_at: string
}

export interface ContentSeries {
  id: string
  user_id: string
  nome: string
  descricao: string
  pillar_id: string
  total_episodios: number
  status: 'ativa' | 'concluida' | 'pausada'
  created_at: string
}

export interface GeneratedContent {
  id: string
  user_id: string
  tipo: 'legenda' | 'carrossel' | 'roteiro' | 'hook' | 'copy_oferta' | 'dm_template'
  titulo: string
  serie_id?: string
  pillar_id?: string
  episodio_numero?: number
  input_prompt: string
  output_content: Record<string, unknown>
  quality_score?: number
  quality_flags?: AuditFlag[]
  status: 'draft' | 'aprovado' | 'publicado' | 'arquivado'
  plataforma?: string
  tokens_used?: number
  starred: boolean
  tags: string[]
  created_at: string
}

export interface ContentIdea {
  id: string
  user_id: string
  titulo: string
  angulo: string
  formato: 'reel' | 'carrossel' | 'story' | 'live'
  serie_id?: string
  pillar_id?: string
  origem: 'manual' | 'pauta_quente' | 'ai_sugestao'
  status: 'backlog' | 'em_producao' | 'gravado' | 'publicado'
  prioridade: number
  hook_principal?: string
  modelo_hook?: 'caso_virada' | 'contrintuitivo' | 'diagnostico' | 'dado_narrativa'
  notas?: string
  data_sugerida?: string
  created_at: string
}

export interface CalendarItem {
  id: string
  user_id: string
  idea_id?: string
  content_id?: string
  titulo: string
  plataforma: string
  formato: string
  pillar_id?: string
  data_publicacao: string
  horario?: string
  status: 'planejado' | 'publicado' | 'cancelado'
  notas?: string
  created_at: string
}

export interface ContentMetrics {
  id: string
  user_id: string
  content_id: string
  plataforma: string
  views: number
  likes: number
  comentarios: number
  compartilhamentos: number
  salvamentos: number
  dms_gerados: number
  vendas_atribuidas: number
  data_registro: string
}

export interface Hook {
  id: string
  user_id: string
  texto_tela: string
  texto_falado?: string
  modelo: 'caso_virada' | 'contrintuitivo' | 'diagnostico' | 'dado_narrativa'
  intencao: 'atracao' | 'autoridade' | 'conexao' | 'venda'
  tema?: string
  pillar_id?: string
  performance_score?: number
  starred: boolean
  created_at: string
}

export interface AuditResult {
  score: number
  aprovado: boolean
  flags: AuditFlag[]
}

export interface AuditFlag {
  tipo: string
  descricao: string
  trecho: string
  sugestao: string
}

export interface CarrosselSlide {
  numero: number
  tipo: 'capa' | 'conteudo' | 'cta'
  titulo: string
  subtitulo?: string
  corpo?: string
  visual_sugerido?: string
}

export interface CarrosselOutput {
  slides: CarrosselSlide[]
  legenda_pronta: string
}

export type PillarKey = 'VOLTAGEM' | 'MATERIA' | 'METODO' | 'SINAL'

export const PILLAR_COLORS: Record<PillarKey, string> = {
  VOLTAGEM: '#e8a838',
  MATERIA: '#3d9970',
  METODO: '#2980b9',
  SINAL: '#c9a84c',
}

export const PILLAR_LABELS: Record<PillarKey, string> = {
  VOLTAGEM: 'VOLTAGEM',
  MATERIA: 'MATÉRIA',
  METODO: 'MÉTODO',
  SINAL: 'SINAL',
}
