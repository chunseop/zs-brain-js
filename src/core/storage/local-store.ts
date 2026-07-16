import localforage from 'localforage'

/** IndexedDB-backed store for structured data (user profile, game progress). */
export const localStore = localforage.createInstance({
  name: 'zs-brain',
  storeName: 'app_data',
})

export interface UserProfile {
  username: string | null
}

export interface GameProgressRecord {
  gameId: string
  level: number
  updatedAt: string
}

export async function getUserProfile(): Promise<UserProfile | null> {
  return localStore.getItem<UserProfile>('user_profile')
}

export async function setUserProfile(profile: UserProfile): Promise<void> {
  await localStore.setItem('user_profile', profile)
}

export async function getGameProgress(gameId: string): Promise<GameProgressRecord | null> {
  return localStore.getItem<GameProgressRecord>(`game_progress:${gameId}`)
}

export async function setGameProgress(record: GameProgressRecord): Promise<void> {
  await localStore.setItem(`game_progress:${record.gameId}`, record)
}
