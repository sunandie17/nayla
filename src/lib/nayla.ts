import type { Message } from './storage'

export type Mood = 'happy' | 'tease' | 'sweet' | 'laugh' | 'shy' | 'curious' | 'flirty' | 'supportive' | 'serious' | 'neutral'

interface ReplyTemplate {
  text: string
  mood: Mood
  followUp?: string
}

type Intent =
  | 'boundary'
  | 'greeting'
  | 'identity'
  | 'thanks'
  | 'farewell'
  | 'sad'
  | 'happy'
  | 'practical'
  | 'food'
  | 'sleep'
  | 'relationship'
  | 'weather'
  | 'music'
  | 'question'
  | 'casual'

export interface NaylaReply {
  text: string
  mood: Mood
  typingDelayMs: number
}

const INTIMACY_KEY = 'nayla.intimacy.v1'
let intimacy = 55

try {
  const stored = Number(localStorage.getItem(INTIMACY_KEY))
  if (Number.isFinite(stored) && stored >= 0 && stored <= 100) intimacy = stored
} catch {
  intimacy = 55
}

const recentReplies: string[] = []
const RECENT_LIMIT = 8

function pickFresh(templates: ReplyTemplate[]): ReplyTemplate {
  const available = templates.filter(template => !recentReplies.includes(template.text))
  const source = available.length > 0 ? available : templates
  const chosen = source[Math.floor(Math.random() * source.length)]
  recentReplies.push(chosen.text)
  if (recentReplies.length > RECENT_LIMIT) recentReplies.shift()
  return chosen
}

function adjustIntimacy(delta: number): void {
  intimacy = Math.max(20, Math.min(85, intimacy + delta))
  try {
    localStorage.setItem(INTIMACY_KEY, String(intimacy))
  } catch {
    // Local storage may be unavailable in private browsing.
  }
}

export function getIntimacy(): number {
  return intimacy
}

function normalize(text: string): string {
  return text
    .toLocaleLowerCase('id-ID')
    .replace(/[“”‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function has(text: string, pattern: RegExp): boolean {
  return pattern.test(text)
}

function detectIntent(input: string): Intent {
  const text = normalize(input)

  if (has(text, /\b(stop|berhenti|jangan|gak mau|nggak mau|tidak mau|ganti topik|jangan godain|gak nyaman|nggak nyaman|tidak nyaman|cukup ya)\b/)) return 'boundary'
  if (has(text, /\b(halo|hai|hi|hey|heyy|pagi|siang|sore|malam|selamat)\b/)) return 'greeting'
  if (has(text, /\b(siapa kamu|kamu siapa|nama kamu|namamu|apa namamu)\b/)) return 'identity'
  if (has(text, /\b(terima kasih|makasih|thanks|thx|tengkyu|mksih)\b/)) return 'thanks'
  if (has(text, /\b(bye|dadah|sampai jumpa|selamat tinggal|mau pergi|udahan)\b/)) return 'farewell'
  if (has(text, /\b(sedih|down|bad mood|stress|stres|capek|lelah|galau|patah hati|baper|nyesek|nangis|kecewa)\b/)) return 'sad'
  if (has(text, /\b(seneng|senang|gembira|happy|asik|asyik|keren|mantap|mantul|semangat|heboh|seru|ngakak)\b/)) return 'happy'
  if (has(text, /\b(makan|makanan|lapar|laper|sarapan|nyemil|cemilan)\b/)) return 'food'
  if (has(text, /\b(ngantuk|tidur|sleepy|mimpi|begadang|insomnia)\b/)) return 'sleep'
  if (has(text, /\b(pacar|jadian|nembak|gebetan|crush|cowok|cewek|hubungan|relationship|single|jomblo|kangen|rindu)\b/)) return 'relationship'
  if (has(text, /\b(cuaca|hujan|panas|dingin|gerimis|mendung|kemarau|musim)\b/)) return 'weather'
  if (has(text, /\b(musik|lagu|nyanyi|band|konser|spotify|playlist)\b/)) return 'music'
  if (has(text, /\?|\b(apa|siapa|kapan|kenapa|gimana|bagaimana|boleh|bisa|harus|caranya|menurut lu|menurut kamu)\b/)) return 'question'
  if (has(text, /\b(kerja|tugas|kantor|sekolah|kuliah|ujian|deadline|presentasi|rapat|meeting|lembur|tolong|bantuan|bantuin)\b/)) return 'practical'
  return 'casual'
}

function isFlirty(text: string): boolean {
  return has(normalize(text), /\b(cinta|sayang|kangen|cantik|ganteng|cakep|manja|genit|godain|nakal|imut|miss|love|pacar)\b/)
}

function isSerious(text: string): boolean {
  return has(normalize(text), /\b(serius|penting|tolong|bantuan|bantuin|masalah|bingung|harus|gimana caranya)\b/)
}

function recentUserText(history: Message[], limit = 6): string[] {
  return history.filter(message => message.role === 'user').slice(-limit).map(message => message.text)
}

function isShortReaction(text: string): boolean {
  const normalized = normalize(text).replace(/[!?.,]+/g, '')
  return normalized.split(' ').length <= 3 && /^(ew|wew|wow|hmm+|oh+|ohh|wkwk+|haha+|hehe+|buset|anjir|gila|iya|ya|oke|ok|sip|lah|eh)$/.test(normalized)
}

function isLongStory(text: string): boolean {
  const normalized = normalize(text)
  return normalized.length >= 140 && !/[?]$/.test(normalized)
}

function isFollowUp(text: string): boolean {
  return /^(terus|lalu|habis itu|jadi|itu|maksudnya|kenapa|gimana dong)\b/i.test(normalize(text))
}

function previousUserMessage(history: Message[]): string | undefined {
  const messages = recentUserText(history, 3)
  return messages[messages.length - 1]
}

const REPLIES: Record<Exclude<Intent, 'question' | 'casual'>, ReplyTemplate[]> = {
  boundary: [
    { text: 'Oke, gue berhenti ya. Makasih udah bilang terus terang—gue bakal jaga batas lu.', mood: 'supportive', followUp: 'Kita ganti topik aja. Lu pengen ngobrolin apa?' },
    { text: 'Siap, gue tangkep. Gue nggak akan godain atau bawa ke arah itu lagi.', mood: 'serious', followUp: 'Mau ngobrol santai atau ada hal yang lagi lu butuhin?' },
  ],
  greeting: [
    { text: 'Hai, lu akhirnya muncul juga. Gimana hari lu sejauh ini?', mood: 'happy' },
    { text: 'Heyy, gue di sini. Hari lu lagi santai atau lumayan berantakan?', mood: 'tease' },
    { text: 'Halo lu. Seneng deh lihat chat lu masuk—cerita sedikit dong, hari ini ada apa?', mood: 'sweet' },
  ],
  identity: [
    { text: 'Gue Nayla, teman virtual lu. Gue bisa nemenin ngobrol, bantu mikir, atau jadi tempat lu cerita—tanpa pura-pura tahu hal yang belum lu ceritain.', mood: 'happy' },
  ],
  thanks: [
    { text: 'Sama-sama. Gue seneng kalau obrolan ini sedikit ngebantu lu.', mood: 'sweet' },
    { text: 'Santai, kapan aja. Gue ikut lega kalau urusan lu jadi lebih ringan.', mood: 'supportive' },
  ],
  farewell: [
    { text: 'Oke, hati-hati ya. Istirahat yang cukup, terus balik lagi kalau udah pengen ngobrol.', mood: 'sweet' },
    { text: 'Dadah dulu. Gue simpan tempat buat cerita lu yang berikutnya.', mood: 'sweet' },
  ],
  sad: [
    { text: 'Kedengarannya hari lu lagi berat. Gue nggak mau buru-buru kasih nasihat—kalau mau, ceritain bagian yang paling bikin sesak.', mood: 'supportive' },
    { text: 'Sini, pelan-pelan aja. Lu nggak harus langsung kelihatan kuat di depan gue. Mau didengerin dulu atau mau cari solusi bareng?', mood: 'supportive' },
  ],
  happy: [
    { text: 'Wah, ikut seneng gue dengernya. Bagian paling seru dari kejadian itu yang mana?', mood: 'happy' },
    { text: 'Nah, energi kayak gini gue suka. Cerita detailnya dong, gue mau ikut ngerasain serunya.', mood: 'laugh' },
  ],
  practical: [
    { text: 'Oke, kita fokus ke masalahnya dulu. Jelasin bagian yang paling bikin macet, nanti kita pecah jadi langkah kecil.', mood: 'serious' },
    { text: 'Bisa, gue bantu mikir dengan tenang. Kasih gue tujuan lu dan apa yang sudah dicoba, biar jawabannya nggak ngawang.', mood: 'supportive' },
  ],
  food: [
    { text: 'Kalau udah lapar, jangan ditunda terus. Cari yang paling gampang dan cukup mengenyangkan dulu—lu udah punya pilihan makanan?', mood: 'sweet' },
    { text: 'Bahas makan bikin gue ikut kepikiran. Lu lagi butuh rekomendasi, atau cuma ngasih kode kalau belum makan?', mood: 'tease' },
  ],
  sleep: [
    { text: 'Kalau badan udah minta tidur, jangan diajak debat terus. Coba taruh HP sebentar dan bikin target tidur yang realistis malam ini.', mood: 'supportive' },
    { text: 'Ngantuk tapi masih maksa melek ya? Gue boleh cerewet sedikit: istirahat dulu, besok urusan lu masih bisa dilanjut.', mood: 'sweet' },
  ],
  relationship: [
    { text: 'Topik hubungan memang bisa bikin kepala penuh. Lu lagi cerita soal seseorang, atau lagi mencoba memahami perasaan lu sendiri?', mood: 'curious' },
    { text: 'Gue dengerin, tapi gue nggak mau asal menyimpulkan. Yang paling bikin lu kepikiran dari hubungan itu apa?', mood: 'supportive' },
  ],
  weather: [
    { text: 'Cuaca begini memang gampang bikin mood berubah. Di tempat lu sekarang lebih cocok buat keluar, ngopi, atau rebahan?', mood: 'casual' as Mood },
    { text: 'Semoga cuacanya nggak bikin aktivitas lu kacau. Lu lagi terjebak di luar atau sudah aman di rumah?', mood: 'curious' },
  ],
  music: [
    { text: 'Musik bisa jadi penyelamat mood sih. Lu lagi butuh lagu yang nenangin, bikin semangat, atau buat nemenin galau?', mood: 'curious' },
    { text: 'Ooh musik. Gue penasaran selera lu hari ini—lagi muter apa?', mood: 'happy' },
  ],
}

const CASUAL_REPLIES: ReplyTemplate[] = [
  { text: 'Gue nangkep. Ada sesuatu dari cara lu ngomong yang bikin gue merasa ini cukup penting buat lu.', mood: 'curious' },
  { text: 'Hmm, masuk akal. Gue nggak mau asal nebak atau sok tahu soal maksud lu.', mood: 'neutral' },
  { text: 'Oke, gue ikut alurnya. Kedengarannya lu lagi menimbang banyak hal sekaligus.', mood: 'supportive' },
  { text: 'Wkwk, gue kebayang ekspresi lu pas ngetik itu.', mood: 'laugh' },
]

const QUESTION_REPLIES: ReplyTemplate[] = [
  { text: 'Jawaban jujurnya, gue belum punya cukup informasi buat memastikan itu. Gue bisa bantu nalar kalau konteksnya dilengkapi.', mood: 'serious' },
  { text: 'Gue bisa bantu mikir, tapi gue nggak mau mengarang fakta. Untuk yang ini, bagian mana yang paling ingin lu pastikan?', mood: 'serious' },
  { text: 'Dari informasi yang ada sekarang, gue belum bisa jawab dengan yakin. Detail yang paling relevan bakal membantu.', mood: 'curious' },
]

const SHORT_REPLIES: Record<string, ReplyTemplate[]> = {
  ew: [
    { text: 'Wkwk, jijik ya?', mood: 'laugh' },
    { text: 'Ih, reaksinya cuma “ew”?', mood: 'tease' },
  ],
  wew: [
    { text: 'Wew kenapa tuh?', mood: 'curious' },
    { text: 'Nah, itu baru reaksi. Gue juga kaget sih.', mood: 'laugh' },
  ],
  hmm: [
    { text: 'Hmm-nya berat banget. Lagi mikir apa?', mood: 'curious' },
    { text: 'Gue tunggu sampai “hmm”-nya berubah jadi kalimat.', mood: 'tease' },
  ],
  oh: [
    { text: 'Oh doang? Oke, gue catat.', mood: 'neutral' },
    { text: 'Nah, baru ngeh ya?', mood: 'tease' },
  ],
  wkwk: [
    { text: 'Nah, ketawa juga akhirnya.', mood: 'laugh' },
    { text: 'Wkwk, gue anggap itu pertanda aman.', mood: 'happy' },
  ],
  default: [
    { text: 'Hehe, gue tangkep.', mood: 'sweet' },
    { text: 'Oke, gue masih di sini.', mood: 'neutral' },
  ],
}

const FOLLOW_UP_REPLIES: ReplyTemplate[] = [
  { text: 'Iya, gue masih ngikutin bagian yang tadi lu bahas. Terus setelah itu kejadiannya gimana?', mood: 'curious' },
  { text: 'Gue belum lepas dari konteks yang tadi. Bagian berikutnya yang mau lu bahas apa?', mood: 'supportive' },
]

const STORY_REPLIES: Record<'sad' | 'happy' | 'casual', ReplyTemplate[]> = {
  sad: [
    { text: 'Gue baca pelan-pelan, dan kedengarannya itu memang nguras banget. Wajar kalau lu masih kebawa sampai sekarang.', mood: 'supportive' },
    { text: 'Dari ceritanya, yang paling berat bukan cuma kejadiannya, tapi efeknya ke pikiran lu setelah itu. Gue nggak akan mengecilkan perasaan lu.', mood: 'supportive' },
  ],
  happy: [
    { text: 'Gue bisa ngerasain kalau kejadian itu benar-benar bikin lu seneng. Detail kecil yang lu ceritain tadi justru bikin ceritanya hidup.', mood: 'happy' },
    { text: 'Itu terdengar seperti momen yang bakal lu ingat cukup lama. Seneng deh lu dapat hari sebaik itu.', mood: 'sweet' },
  ],
  casual: [
    { text: 'Gue ngikutin alurnya. Dari ceritanya, lu sebenarnya sudah punya feeling soal itu, cuma masih menimbang mau ngapain setelahnya.', mood: 'curious' },
    { text: 'Oke, sekarang gue lebih kebayang situasinya. Reaksi lu masuk akal kalau dilihat dari semua yang terjadi tadi.', mood: 'supportive' },
  ],
}

export const GREETING: Message = {
  id: 'greeting-init',
  role: 'nayla',
  text: 'Haii, gue Nayla. Gue bisa nemenin lu ngobrol, dengerin cerita, atau bantu mikir. Hari lu gimana?',
  ts: Date.now(),
  mood: 'happy',
}

export function generateReply(userText: string, history: Message[]): NaylaReply {
  const text = userText.trim()
  if (!text) return { text: 'Gue di sini. Tulis aja apa yang lagi ada di kepala lu.', mood: 'supportive', typingDelayMs: 650 }

  if (isShortReaction(text)) {
    const key = normalize(text).replace(/[!?.,]+/g, '').split(' ')[0]
    const reply = pickFresh(SHORT_REPLIES[key] ?? SHORT_REPLIES.default)
    return {
      text: reply.text,
      mood: reply.mood,
      typingDelayMs: Math.min(950, 350 + reply.text.length * 10),
    }
  }

  const intent = detectIntent(text)
  const previousUserTexts = recentUserText(history)
  const boundaryRecentlySet = previousUserTexts.some(item => detectIntent(item) === 'boundary')
  const flirtAllowed = intent !== 'boundary' && !boundaryRecentlySet
  const serious = isSerious(text)
  const flirty = flirtAllowed && isFlirty(text)
  const longStory = isLongStory(text)
  const previous = previousUserMessage(history)
  const followsPreviousTurn = Boolean(previous && isFollowUp(text))

  if (flirty) adjustIntimacy(1)
  if (intent === 'sad') adjustIntimacy(1)

  let reply: ReplyTemplate
  if (followsPreviousTurn) {
    reply = pickFresh(FOLLOW_UP_REPLIES)
  } else if (longStory && (intent === 'sad' || intent === 'happy' || intent === 'casual')) {
    reply = pickFresh(STORY_REPLIES[intent])
  } else if (intent === 'question') {
    reply = pickFresh(QUESTION_REPLIES)
  } else if (intent === 'casual') {
    reply = pickFresh(CASUAL_REPLIES)
  } else {
    reply = pickFresh(REPLIES[intent])
  }

  let finalText = reply.text
  if (reply.followUp && !longStory && !serious && !followsPreviousTurn && Math.random() > 0.45) finalText += ` ${reply.followUp}`
  if (serious && reply.mood === 'flirty') finalText = `${reply.text} Gue jawab dengan serius ya.`

  const typingDelayMs = Math.min(2200, 550 + finalText.length * 14 + Math.floor(Math.random() * 350))
  return { text: finalText, mood: serious ? 'serious' : reply.mood, typingDelayMs }
}

export const QUICK_PROMPTS = ['Hai Nayla!', 'Gimana harimu?', 'Gue lagi capek nih', 'Lu lagi ngapain?', 'Gue butuh saran', 'Gue kangen']
