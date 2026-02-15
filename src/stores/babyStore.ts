import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { Baby, CreateBabyInput, UpdateBabyInput } from '@/types'
import { getStoredData, setStoredData, STORAGE_KEYS } from '@/services/storage/mmkv'

interface BabyState {
  babies: Baby[]
  currentBabyId: string | null
  isLoading: boolean
  error: string | null

  // Actions
  loadBabies: () => Promise<void>
  addBaby: (input: CreateBabyInput) => Promise<Baby>
  updateBaby: (id: string, input: UpdateBabyInput) => Promise<Baby | null>
  deleteBaby: (id: string) => Promise<void>
  setCurrentBaby: (id: string) => Promise<void>
  getCurrentBaby: () => Baby | null
  clearError: () => void
}

export const useBabyStore = create<BabyState>((set, get) => ({
  babies: [],
  currentBabyId: null,
  isLoading: false,
  error: null,

  loadBabies: async () => {
    try {
      set({ isLoading: true, error: null })
      const storedBabies = await getStoredData<Baby[]>(STORAGE_KEYS.BABIES)
      const storedCurrentId = await getStoredData<string>(STORAGE_KEYS.CURRENT_BABY_ID)

      const babies = storedBabies || []
      const currentBabyId = storedCurrentId || (babies.length > 0 ? babies[0].id : null)

      set({ babies, currentBabyId, isLoading: false })
    } catch (error) {
      set({ error: 'Failed to load babies', isLoading: false })
    }
  },

  addBaby: async (input: CreateBabyInput) => {
    const newBaby: Baby = {
      id: uuidv4(),
      name: input.name,
      birthDate: input.birthDate,
      gender: input.gender,
      avatar: input.avatar,
      createdAt: new Date().toISOString(),
    }

    const state = get()
    const updatedBabies = [...state.babies, newBaby]
    await setStoredData(STORAGE_KEYS.BABIES, updatedBabies)

    const newCurrentId = state.currentBabyId || newBaby.id
    if (!state.currentBabyId) {
      await setStoredData(STORAGE_KEYS.CURRENT_BABY_ID, newCurrentId)
    }

    set({
      babies: updatedBabies,
      currentBabyId: newCurrentId,
      error: null,
    })

    return newBaby
  },

  updateBaby: async (id: string, input: UpdateBabyInput) => {
    const state = get()
    const babyIndex = state.babies.findIndex((b) => b.id === id)
    if (babyIndex === -1) {
      set({ error: 'Baby not found' })
      return null
    }

    const babies = [...state.babies]
    const updatedBaby = { ...babies[babyIndex], ...input }
    babies[babyIndex] = updatedBaby

    await setStoredData(STORAGE_KEYS.BABIES, babies)
    set({ babies, error: null })

    return updatedBaby
  },

  deleteBaby: async (id: string) => {
    const state = get()
    const babies = state.babies.filter((b) => b.id !== id)
    await setStoredData(STORAGE_KEYS.BABIES, babies)

    let currentBabyId = state.currentBabyId
    if (currentBabyId === id) {
      currentBabyId = babies.length > 0 ? babies[0].id : null
      if (currentBabyId) {
        await setStoredData(STORAGE_KEYS.CURRENT_BABY_ID, currentBabyId)
      } else {
        await setStoredData(STORAGE_KEYS.CURRENT_BABY_ID, null as any)
      }
    }

    set({ babies, currentBabyId, error: null })
  },

  setCurrentBaby: async (id: string) => {
    const state = get()
    if (!state.babies.find((b) => b.id === id)) {
      set({ error: 'Baby not found' })
      return
    }

    await setStoredData(STORAGE_KEYS.CURRENT_BABY_ID, id)
    set({ currentBabyId: id, error: null })
  },

  getCurrentBaby: () => {
    const state = get()
    if (!state.currentBabyId) return null
    return state.babies.find((b) => b.id === state.currentBabyId) || null
  },

  clearError: () => set({ error: null }),
}))
