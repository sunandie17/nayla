import { useState } from 'react'
import './Gallery.css'

export type GalleryCategory = 'Selfie' | 'Outfit' | 'Aktivitas' | 'Momen Bersama'

interface GalleryPhoto {
  id: string
  category: GalleryCategory
  title: string
  description: string
  label: string
  src: string
}

const PHOTOS: GalleryPhoto[] = [
  {
    id: 'selfie-glasses',
    category: 'Selfie',
    title: 'Kacamata hitam',
    description: 'Selfie dekat Nayla dengan rambut hitam panjang dan frame kacamata tegas.',
    label: 'Selfie · koleksi Nayla',
    src: '/assets/images/nayla/selfies/Maroon_Glasses_Selfie_Portrait.png',
  },
  {
    id: 'selfie-red',
    category: 'Selfie',
    title: 'Red dress selfie',
    description: 'Potret selfie Nayla dengan gaya modern dan nuansa merah yang berani.',
    label: 'Selfie · koleksi Nayla',
    src: '/assets/images/nayla/selfies/Polished_Red_Dress_Selfie_Portrait.png',
  },
  {
    id: 'outfit-red',
    category: 'Outfit',
    title: 'Gaya merah favorit',
    description: 'Outfit merah Nayla dengan siluet rapi dan gaya yang percaya diri.',
    label: 'Outfit · gaya modern',
    src: '/assets/images/nayla/selfies/Polished_Red_Dress_Selfie_Portrait.png',
  },
  {
    id: 'activity-glasses',
    category: 'Aktivitas',
    title: 'Sore yang tenang',
    description: 'Nayla menikmati suasana sore dengan tampilan kasual dan ekspresi natural.',
    label: 'Aktivitas · sore santai',
    src: '/assets/images/nayla/selfies/Maroon_Glasses_Selfie_Portrait.png',
  },
  {
    id: 'cafe-together',
    category: 'Momen Bersama',
    title: 'Ngopi di kafe',
    description: 'Momen bersama Nayla di kafe hangat, hanya untuk koleksi momen bersama.',
    label: 'Momen Bersama · kafe',
    src: '/assets/images/nayla/moments/Swafoto_Pasangan_di_Kafe_Hangat.png',
  },
]

const CATEGORIES: Array<'Semua' | GalleryCategory> = ['Semua', 'Selfie', 'Outfit', 'Aktivitas', 'Momen Bersama']

interface GalleryProps {
  onClose: () => void
}

export default function Gallery({ onClose }: GalleryProps) {
  const [category, setCategory] = useState<'Semua' | GalleryCategory>('Semua')
  const [selectedId, setSelectedId] = useState(PHOTOS[0].id)
  const [missingImages, setMissingImages] = useState<Set<string>>(new Set())

  const photos = category === 'Semua' ? PHOTOS : PHOTOS.filter(photo => photo.category === category)
  const selected = photos.find(photo => photo.id === selectedId) ?? photos[0]

  const markMissing = (id: string) => {
    setMissingImages(previous => new Set(previous).add(id))
  }

  return (
    <div className="gallery-overlay" role="dialog" aria-modal="true" aria-label="Galeri foto Nayla">
      <section className="gallery-panel">
        <header className="gallery-header">
          <div>
            <span className="eyebrow">Koleksi visual</span>
            <h2>Foto Nayla</h2>
            <p>Foto referensi lokal Nayla, bukan gambar hasil generasi baru.</p>
          </div>
          <button className="gallery-close" onClick={onClose} aria-label="Tutup galeri" title="Tutup galeri">×</button>
        </header>

        <nav className="gallery-tabs" aria-label="Kategori galeri">
          {CATEGORIES.map(item => (
            <button
              key={item}
              className={category === item ? 'active' : ''}
              onClick={() => {
                setCategory(item)
                const first = item === 'Semua' ? PHOTOS[0] : PHOTOS.find(photo => photo.category === item)
                if (first) setSelectedId(first.id)
              }}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="gallery-content">
          <div className="gallery-main">
            {selected && !missingImages.has(selected.id) ? (
              <img
                className="gallery-featured"
                src={selected.src}
                alt={selected.title}
                onError={() => markMissing(selected.id)}
              />
            ) : (
              <div className="gallery-fallback">
                <span>Foto belum tersedia</span>
                <small>Aset lokal untuk adegan ini belum ditemukan.</small>
              </div>
            )}
            {selected && (
              <div className="gallery-caption">
                <span>{selected.label}</span>
                <h3>{selected.title}</h3>
                <p>{selected.description}</p>
              </div>
            )}
          </div>

          <div className="gallery-grid" aria-label="Daftar foto">
            {photos.map(photo => (
              <button
                key={photo.id}
                className={`gallery-thumb ${selected?.id === photo.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(photo.id)}
              >
                {!missingImages.has(photo.id) ? (
                  <img src={photo.src} alt="" onError={() => markMissing(photo.id)} />
                ) : (
                  <span className="thumb-fallback">Tidak tersedia</span>
                )}
                <span>{photo.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
