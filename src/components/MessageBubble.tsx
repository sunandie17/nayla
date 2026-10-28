import Avatar from './Avatar'
import type { Message } from '../lib/storage'
import './MessageBubble.css'

interface Props {
  message: Message
  mood?: string
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export default function MessageBubble({ message, mood }: Props) {
  const isNayla = message.role === 'nayla'
  return (
    <div className={`message ${isNayla ? 'nayla' : 'user'}`}>
      {isNayla && <Avatar size="md" />}
      <div className="content">
        <div className="bubble">
          {message.text}
        </div>
        <div className="meta">
          <span className="timestamp">{formatTime(message.ts)}</span>
          {isNayla && mood && <span className="mood-tag">· {mood}</span>}
        </div>
      </div>
    </div>
  )
}

export function TypingBubble() {
  return (
    <div className="message nayla">
      <Avatar size="md" />
      <div className="content">
        <div className="bubble">
          <span className="typing">
            <span />
            <span />
            <span />
          </span>
        </div>
      </div>
    </div>
  )
}
