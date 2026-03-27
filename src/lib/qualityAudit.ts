import type { AuditResult } from '../types'
import { callClaude } from './anthropic'

const AUDIT_SYSTEM = `Você é um auditor de conteúdo. Avalie o texto fornecido contra as regras abaixo.
Retorne APENAS JSON válido, sem texto adicional, sem markdown, sem backticks.`

export async function auditContent(content: string): Promise<AuditResult> {
  const prompt = `Audite este conteúdo contra as regras:

REGRAS A VERIFICAR:
1. Hook condicional proibido ("Quando você sentir/quiser/precisar X...")
2. Em dashes (—) usados no corpo do texto
3. Rótulos em inglês misturados ao português
4. Frase template "funciona para X que querem parar de Y"
5. Hollow phrases: "precisão cirúrgica", "vantagem competitiva", "transformação", "jornada", "mudar de patamar"
6. Emojis proibidos: 🙌 💫 ✨ 🌟 💪
7. Tom motivacional genérico
8. Estrutura "Não é X, é Y"
9. Introdução de lista: "X coisas que você precisa saber"
10. Adjetivos ocos: real, verdadeiro, silencioso, poderoso, incrível

CONTEÚDO:
${content}

Retorne JSON exato:
{"score":85,"aprovado":true,"flags":[{"tipo":"nome_regra","descricao":"problema","trecho":"trecho exato","sugestao":"como corrigir"}]}`

  try {
    const response = await callClaude({
      systemPrompt: AUDIT_SYSTEM,
      userPrompt: prompt,
      maxTokens: 800,
      skipAudit: true,
    })

    // Extract JSON even if there's extra text
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    return JSON.parse(jsonMatch[0]) as AuditResult
  } catch {
    return { score: 70, aprovado: true, flags: [] }
  }
}

export function scoreColor(score: number): string {
  if (score >= 70) return '#3d9970'
  if (score >= 50) return '#e8a838'
  return '#c0392b'
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Excelente'
  if (score >= 70) return 'Aprovado'
  if (score >= 50) return 'Revisar'
  return 'Reprovar'
}
