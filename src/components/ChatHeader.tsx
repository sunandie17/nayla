import Avatar from './Avatar'
import './ChatHeader.css'

interface ChatHeaderProps {
  online: boolean
  onClear: () => void
  onGallery: () => void
}

export default function ChatHeader({ online, onClear, onGallery }: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <Avatar size="lg" online={online} ring />
      <div className="name-block">
        <div className="name">Nayla</div>
        <div className="status">
          <span className="dot" />
          {online ? 'Online · lagi sante nih' : 'Offline'}
        </div>
      </div>
      <div className="header-actions">
        <button className="gallery-button" onClick={onGallery} title="Buka foto Nayla">
          <span className="gallery-button-icon">▧</span>
          <span>Foto Nayla</span>
        </button>
        <button className="header-btn" onClick={onClear} title="Hapus percakapan" aria-label="Hapus percakapan">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </header>
  )
}
