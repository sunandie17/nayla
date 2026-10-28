// Flag global sederhana untuk fitur baca suara Nayla (Web Speech API).
let speakEnabled = false

export function setSpeakEnabled(v: boolean) {
  speakEnabled = v
}

export function isSpeakEnabled() {
  return speakEnabled
}

export function speak(text: string) {
  if (!speakEnabled) return
  try {
    const synth = window.speechSynthesis
    if (!synth) return
    const clean = text.replace(/[*\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim()
    const u = new SpeechSynthesisUtterance(clean)
    u.lang = 'id-ID'
    u.rate = 1.04
    u.pitch = 1.15
    const voices = synth.getVoices()
    const id = voices.find(v => /id/i.test(v.lang))
    if (id) u.voice = id
    synth.cancel()
    synth.speak(u)
  } catch {
    /* speech API tidak tersedia, abaikan */
  }
}
