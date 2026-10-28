import './Avatar.css'

interface AvatarProps {
  size?: 'md' | 'lg'
  online?: boolean
  ring?: boolean
}

export default function Avatar({ size = 'md', online = false, ring = false }: AvatarProps) {
  return (
    <div className={`nayla-avatar ${size} ${online ? 'online' : ''}`}>
      {ring && <div className="ring" />}
      <img
        src="/assets/images/nayla/selfies/Maroon_Glasses_Selfie_Portrait.png"
        alt="Nayla, perempuan dewasa dengan rambut hitam dan kacamata"
        draggable={false}
        onError={event => {
          event.currentTarget.onerror = null
          event.currentTarget.src = '/nayla-avatar.svg'
        }}
      />
    </div>
  )
}
