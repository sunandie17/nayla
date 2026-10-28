import test from 'node:test'
import assert from 'node:assert/strict'
import { generateReply, type NaylaReply } from './nayla.ts'
import type { Message } from './storage.ts'

const userMessage = (text: string, ts: number): Message => ({ id: `user-${ts}`, role: 'user', text, ts })
const naylaMessage = (text: string, ts: number): Message => ({ id: `nayla-${ts}`, role: 'nayla', text, ts, mood: 'supportive' })

function replyFor(text: string, history: Message[] = []): NaylaReply {
  return generateReply(text, history)
}

test('pesan pendek mendapat jawaban singkat', () => {
  const first = replyFor('ew')
  const second = replyFor('ew')
  assert.ok(first.text.length < 70)
  assert.ok(second.text.length < 70)
  assert.notEqual(first.text, second.text)
})

test('cerita panjang mendapat validasi, bukan pertanyaan generik', () => {
  const reply = replyFor('Hari ini gue datang ke kantor dengan niat biasa saja, tapi ternyata atasan memuji hasil kerja gue di depan semua orang. Gue senang, cuma setelah itu gue malah kepikiran apakah pujian itu benar-benar tulus atau cuma karena sedang butuh bantuan gue.')
  assert.ok(reply.text.length > 40)
  assert.match(reply.text, /gue|lu/i)
  assert.doesNotMatch(reply.text, /lanjut(kan|in) dong|jangan pelit cerita|gue mau denger/i)
})

test('pertanyaan faktual tidak dialihkan menjadi rayuan', () => {
  const reply = replyFor('Apa cara paling aman menyimpan password di aplikasi?')
  assert.match(reply.text, /informasi|konteks|jawab|bantu/i)
  assert.doesNotMatch(reply.text, /sayang|genit|godain|kangen/i)
})

test('batas pengguna menghentikan godaan dan mengikuti pergantian topik', () => {
  const history = [userMessage('Lu godain gue dong', 1), naylaMessage('Boleh, tapi tetap nyaman ya.', 2)]
  const reply = replyFor('Jangan godain gue, ganti topik aja', history)
  assert.match(reply.text, /berhenti|batas|topik/i)
  assert.doesNotMatch(reply.text, /nakal|genit|godain lagi/i)
})

test('pesan lanjutan mengenali konteks giliran sebelumnya', () => {
  const history = [
    userMessage('Tadi gue cerita soal presentasi yang bikin gue gugup', 1),
    naylaMessage('Kedengarannya cukup bikin tegang.', 2),
  ]
  const reply = replyFor('Terus?', history)
  assert.match(reply.text, /konteks|tadi/i)
})
