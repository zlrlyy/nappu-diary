import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { DiaperRecord, CreateDiaperInput, UpdateDiaperInput } from '@/types'
import { getStoredData, setStoredData, STORAGE_KEYS } from '@/services/storage/mmkv'

interface DiaperState {
  records: DiaperRecord[]
  isLoading: boolean
  error: string | null

  // Actions
  loadRecords: () => Promise<void>
  addRecord: (input: CreateDiaperInput) => Promise<DiaperRecord>
  updateRecord: (id: string, input: UpdateDiaperInput) => Promise<DiaperRecord | null>
  deleteRecord: (id: string) => Promise<void>
  getRecordsByBaby: (babyId: string) => DiaperRecord[]
  getRecordsByDate: (babyId: string, date: string) => DiaperRecord[]
  getTodayRecords: (babyId: string) => DiaperRecord[]
  getLastRecord: (babyId: string) => DiaperRecord | null
  clearError: () => void
}

export const useDiaperStore = create<DiaperState>((set, get) => ({
  records: [],
  isLoading: false,
  error: null,

  loadRecords: async () => {
    try {
      set({ isLoading: true, error: null })
      const storedRecords = await getStoredData<DiaperRecord[]>(STORAGE_KEYS.DIAPER_RECORDS)
      set({ records: storedRecords || [], isLoading: false })
    } catch (error) {
      set({ error: 'Failed to load diaper records', isLoading: false })
    }
  },

  addRecord: async (input: CreateDiaperInput) => {
    const newRecord: DiaperRecord = {
      id: uuidv4(),
      babyId: input.babyId,
      type: input.type,
      poopConsistency: input.poopConsistency,
      time: input.time,
      note: input.note,
      createdAt: new Date().toISOString(),
    }

    const state = get()
    const records = [...state.records, newRecord]
    await setStoredData(STORAGE_KEYS.DIAPER_RECORDS, records)
    set({ records, error: null })

    return newRecord
  },

  updateRecord: async (id: string, input: UpdateDiaperInput) => {
    const state = get()
    const recordIndex = state.records.findIndex((r) => r.id === id)
    if (recordIndex === -1) {
      set({ error: 'Record not found' })
      return null
    }

    const records = [...state.records]
    const updatedRecord = { ...records[recordIndex], ...input }
    records[recordIndex] = updatedRecord

    await setStoredData(STORAGE_KEYS.DIAPER_RECORDS, records)
    set({ records, error: null })

    return updatedRecord
  },

  deleteRecord: async (id: string) => {
    const state = get()
    const records = state.records.filter((r) => r.id !== id)
    await setStoredData(STORAGE_KEYS.DIAPER_RECORDS, records)
    set({ records, error: null })
  },

  getRecordsByBaby: (babyId: string) => {
    return get()
      .records.filter((r) => r.babyId === babyId)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  },

  getRecordsByDate: (babyId: string, date: string) => {
    const targetDate = new Date(date).toDateString()
    return get()
      .records.filter((r) => {
        const recordDate = new Date(r.time).toDateString()
        return r.babyId === babyId && recordDate === targetDate
      })
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  },

  getTodayRecords: (babyId: string) => {
    const today = new Date().toDateString()
    return get()
      .records.filter((r) => {
        const recordDate = new Date(r.time).toDateString()
        return r.babyId === babyId && recordDate === today
      })
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  },

  getLastRecord: (babyId: string) => {
    const babyRecords = get()
      .records.filter((r) => r.babyId === babyId)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    return babyRecords.length > 0 ? babyRecords[0] : null
  },

  clearError: () => set({ error: null }),
}))
