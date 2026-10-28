import { useState, useEffect, useRef, useCallback } from 'react'
import ChatHeader from './components/ChatHeader'
import MessageBubble, { TypingBubble } from './components/MessageBubble'
import Composer from './components/Composer'
import Gallery from './components/Gallery'
import { loadMessages, saveMessages, clearMessages, newId, type Message } from './lib/storage'
import { generateReply, GREETING } from './lib/nayla'
import { speak } from './lib/speech'
import './App.css'

const MOOD_LABELS: Record<string, string> = {
  happy: 'seneng',
  tease: 'genit',
  sweet: 'manis',
  laugh: 'ngakak',
  shy: 'malu',
  curious: 'penasaran',
  flirty: 'godain',
  supportive: 'dukung',
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const loaded = loadMessages()
    if (loaded.length === 0) return [{ ...GREETING, id: newId(), ts: Date.now() }]
    return loaded
  })
  const [typing, setTyping] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const typingTimer = useRef<number | null>(null)
  const messagesRef = useRef(messages)
  const responseIdRef = useRef(0)

  // Simpan ke localStorage tiap kali pesan berubah.
  useEffect(() => {
    messagesRef.current = messages
    saveMessages(messages)
  }, [messages])

  // Auto-scroll ke bawah saat pesan baru / typing.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    return () => {
      responseIdRef.current += 1
      if (typingTimer.current) window.clearTimeout(typingTimer.current)
    }
  }, [])

  const handleSend = useCallback((text: string) => {
    const cleanText = text.trim()
    if (!cleanText || typing) return

    const userMsg: Message = { id: newId(), role: 'user', text: cleanText, ts: Date.now() }
    const nextHistory = [...messagesRef.current, userMsg]
    messagesRef.current = nextHistory
    setMessages(nextHistory)
    setTyping(true)

    const responseId = responseIdRef.current + 1
    responseIdRef.current = responseId
    if (typingTimer.current) window.clearTimeout(typingTimer.current)

    let reply
    try {
      reply = generateReply(cleanText, nextHistory)
    } catch {
      reply = {
        text: 'Maaf, gue lagi agak blank. Coba kirim lagi pesan lu sebentar ya.',
        mood: 'supportive' as const,
        typingDelayMs: 700,
      }
    }

    typingTimer.current = window.setTimeout(() => {
      if (responseId !== responseIdRef.current) return
      const naylaMsg: Message = {
        id: newId(),
        role: 'nayla',
        text: reply.text.trim() || 'Gue masih di sini. Coba bilang lagi ya.',
        mood: reply.mood,
        ts: Date.now(),
      }
      const updatedHistory = [...messagesRef.current, naylaMsg]
      messagesRef.current = updatedHistory
      setMessages(updatedHistory)
      setTyping(false)
      typingTimer.current = null
      speak(naylaMsg.text)
    }, reply.typingDelayMs)
  }, [typing])

  const handleClear = () => {
    if (typingTimer.current) window.clearTimeout(typingTimer.current)
    responseIdRef.current += 1
    typingTimer.current = null
    setTyping(false)
    clearMessages()
    const greeting = { ...GREETING, id: newId(), ts: Date.now() }
    messagesRef.current = [greeting]
    setMessages([greeting])
  }

  const showQuickPrompts = messages.length <= 2

  return (
    <div className="app-shell">
      <div className="chat-card">
        <ChatHeader online onClear={handleClear} onGallery={() => setGalleryOpen(true)} />
        <div className="messages-scroll" ref={scrollRef}>
          <div className="messages-inner">
            {messages.map(m => (
              <MessageBubble
                key={m.id}
                message={m}
                mood={m.role === 'nayla' ? MOOD_LABELS[m.mood ?? 'happy'] ?? m.mood : undefined}
              />
            ))}
            {typing && <TypingBubble />}
          </div>
        </div>
        <Composer
          onSend={handleSend}
          disabled={typing}
          showQuickPrompts={showQuickPrompts}
          onQuickPrompt={handleSend}
        />
      </div>
      {galleryOpen && <Gallery onClose={() => setGalleryOpen(false)} />}
    </div>
  )
}
