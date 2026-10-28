export type Role = 'user' | 'nayla'

export interface Message {
  id: string
  role: Role
  text: string
  ts: number
  mood?: string
}

const STORAGE_KEY = 'nayla.chat.v1'

function isMessage(value: unknown): value is Message {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<Message>
  return (
    typeof candidate.id === 'string' &&
    (candidate.role === 'user' || candidate.role === 'nayla') &&
    typeof candidate.text === 'string' &&
    candidate.text.length <= 4000 &&
    typeof candidate.ts === 'number' &&
    Number.isFinite(candidate.ts) &&
    (candidate.mood === undefined || typeof candidate.mood === 'string')
  )
}

export function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Message[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isMessage)
  } catch {
    return []
  }
}

export function saveMessages(messages: Message[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-300)))
  } catch {
    /* ignore quota errors */
  }
}

export function clearMessages(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
