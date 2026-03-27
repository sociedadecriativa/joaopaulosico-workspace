import type { AuditResult } from '../types'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

interface CallClaudeParams {
  systemPrompt: string
  userPrompt: string
  maxTokens?: number
  onStream?: (chunk: string) => void
  skipAudit?: boolean
}

function getApiKey(): string {
  return import.meta.env.VITE_ANTHROPIC_API_KEY || ''
}

export async function callClaude({
  systemPrompt,
  userPrompt,
  maxTokens = 2000,
  onStream,
}: CallClaudeParams): Promise<string> {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY não configurada')

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      stream: !!onStream,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(`API Error ${response.status}: ${error.error?.message || 'Unknown error'}`)
  }

  if (onStream && response.body) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
      for (const line of lines) {
        try {
          const data = JSON.parse(line.slice(6))
          if (data.type === 'content_block_delta' && data.delta?.text) {
            fullText += data.delta.text
            onStream(data.delta.text)
          }
        } catch { /* ignore parse errors */ }
      }
    }
    return fullText
  }

  const data = await response.json()
  return data.content[0]?.text || ''
}

export async function generateWithAudit(params: CallClaudeParams): Promise<{
  content: string
  audit: AuditResult | null
}> {
  const content = await callClaude(params)

  if (params.skipAudit) return { content, audit: null }

  try {
    const { auditContent } = await import('./qualityAudit')
    const audit = await auditContent(content)
    return { content, audit }
  } catch {
    return { content, audit: null }
  }
}
