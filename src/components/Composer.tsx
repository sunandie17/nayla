import { useRef, useState, useEffect } from 'react'
import './Composer.css'
import { QUICK_PROMPTS } from '../lib/nayla'
import { setSpeakEnabled } from '../lib/speech'

interface ComposerProps {
  onSend: (text: string) => void
  disabled?: boolean
  showQuickPrompts: boolean
  onQuickPrompt: (text: string) => void
}

// Ikon inline supaya tidak butuh dependency ekstra.
function MicIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="21" x2="15" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <line x1="9" y1="21" x2="15" y2="21" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="20" y2="12" />
      <polyline points="13 5 20 12 13 19" />
    </svg>
  )
}

function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 3 9 3 15 6 15 11 19 11 5" />
      {on ? (
        <>
          <path d="M16 9a4 4 0 0 1 0 6" />
          <path d="M19 6a8 8 0 0 1 0 12" />
        </>
      ) : (
        <line x1="22" y1="9" x2="16" y2="15" />
      )}
    </svg>
  )
}

export default function Composer({ onSend, disabled, showQuickPrompts, onQuickPrompt }: ComposerProps) {
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const [audioOn, setAudioOn] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [text])

  const submit = () => {
    const t = text.trim()
    if (!t || disabled) return
    onSend(t)
    setText('')
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const toggleMic = () => {
    setRecording(r => !r)
    // Simulasi: setelah 2.5s "rekaman" selesai, otomatis kirim placeholder.
    if (!recording) {
      window.setTimeout(() => {
        setRecording(false)
        onSend('*(lu ngomong sesuatu lewat mikrofon)* 🎤')
      }, 2500)
    }
  }

  const toggleAudio = () => {
    const next = !audioOn
    setAudioOn(next)
    setSpeakEnabled(next)
  }

  return (
    <div className="composer">
      {showQuickPrompts && (
        <div className="quick-prompts">
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => onQuickPrompt(p)} disabled={disabled}>{p}</button>
          ))}
        </div>
      )}
      <div className="composer-row">
        <button
          className={`icon-btn ${recording ? 'active' : ''}`}
          onClick={toggleMic}
          title={recording ? 'Lagi ngererekam...' : 'Tombol mikrofon'}
          aria-label="Mikrofon"
          disabled={disabled}
        >
          <MicIcon filled={recording} />
        </button>

        <div className="input-wrap">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Tulis pesan buat Nayla..."
            rows={1}
            disabled={disabled}
          />
        </div>

        <button
          className={`icon-btn ${audioOn ? 'active' : ''}`}
          onClick={toggleAudio}
          style={audioOn ? { background: 'var(--success)', borderColor: 'var(--success)', color: '#0a1f14', animation: 'none' } : {}}
          title={audioOn ? 'Suara Nayla aktif' : 'Aktifkan suara Nayla'}
          aria-label="Audio"
        >
          <SpeakerIcon on={audioOn} />
        </button>

        <button
          className="send-btn"
          onClick={submit}
          disabled={!text.trim() || disabled}
          title="Kirim"
          aria-label="Kirim pesan"
        >
          <SendIcon />
        </button>
      </div>

      {recording && <div className="recording-hint">Lagi ngererekam... tap lagi buat berhenti</div>}
      {audioOn && <div className="audio-on-hint"><b>Suara Nayla aktif</b> — pesannya bakal dibacakan (simulasi)</div>}
    </div>
  )
}
