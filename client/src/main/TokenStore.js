import { app, safeStorage } from 'electron'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { readFile, writeFile, rm } from 'node:fs/promises'
const SessionFile = () => join(app.getPath('userData'), 'session.bin')
function CanEncrypt() {
  if (!safeStorage.isEncryptionAvailable()) return false
  if (process.platform === 'linux') {
    return safeStorage.getSelectedStorageBackend() !== 'basic_text'
  }
  return true
}
export async function SaveRefreshToken(token) {
  if (!CanEncrypt()) return false
  await writeFile(SessionFile(), safeStorage.encryptString(token), { mode: 0o600 })
  return true
}
export async function LoadRefreshToken() {
  if (!CanEncrypt() || !existsSync(SessionFile())) return null
  try {
    return safeStorage.decryptString(await readFile(SessionFile()))
  } catch {
    return null
  }
}
export async function ClearRefreshToken() {
  await rm(SessionFile(), { force: true })
}
