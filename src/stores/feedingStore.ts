import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { FeedingRecord, CreateFeedingInput, UpdateFeedingInput } from '@/types'
import { getStoredData, setStoredData, STORAGE_KEYS } from '@/services/storage/mmkv'

interface FeedingState {
  records: FeedingRecord[]
  isLoading: boolean
  error: string | null

  // Actions
  loadRecords: () => Promise<void>
  addRecord: (input: CreateFeedingInput) => Promise<FeedingRecord>
  updateRecord: (id: string, input: UpdateFeedingInput) => Promise<FeedingRecord | null>
  deleteRecord: (id: string) => Promise<void>
  getRecordsByBaby: (babyId: string) => FeedingRecord[]
  getRecordsByDate: (babyId: string, date: string) => FeedingRecord[]
  getTodayRecords: (babyId: string) => FeedingRecord[]
  getLastRecord: (babyId: string) => FeedingRecord | null
  clearError: () => void
}

export const useFeedingStore = create<FeedingState>((set, get) => ({
  records: [],
  isLoading: false,
  error: null,

  loadRecords: async () => {
    try {
      set({ isLoading: true, error: null })
      const storedRecords = await getStoredData<FeedingRecord[]>(STORAGE_KEYS.FEEDING_RECORDS)
      set({ records: storedRecords || [], isLoading: false })
    } catch (error) {
      set({ error: 'Failed to load feeding records', isLoading: false })
    }
  },

  addRecord: async (input: CreateFeedingInput) => {
    const newRecord: FeedingRecord = {
      id: uuidv4(),
      babyId: input.babyId,
      type: input.type,
      amount: input.amount,
      duration: input.duration,
      breastSide: input.breastSide,
      startTime: input.startTime,
      endTime: input.endTime,
      note: input.note,
      createdAt: new Date().toISOString(),
    }

    const state = get()
    const records = [...state.records, newRecord]
    await setStoredData(STORAGE_KEYS.FEEDING_RECORDS, records)
    set({ records, error: null })

    return newRecord
  },

  updateRecord: async (id: string, input: UpdateFeedingInput) => {
    const state = get()
    const recordIndex = state.records.findIndex((r) => r.id === id)
    if (recordIndex === -1) {
      set({ error: 'Record not found' })
      return null
    }

    const records = [...state.records]
    const updatedRecord = { ...records[recordIndex], ...input }
    records[recordIndex] = updatedRecord

    await setStoredData(STORAGE_KEYS.FEEDING_RECORDS, records)
    set({ records, error: null })

    return updatedRecord
  },

  deleteRecord: async (id: string) => {
    const state = get()
    const records = state.records.filter((r) => r.id !== id)
    await setStoredData(STORAGE_KEYS.FEEDING_RECORDS, records)
    set({ records, error: null })
  },

  getRecordsByBaby: (babyId: string) => {
    return get()
      .records.filter((r) => r.babyId === babyId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  },

  getRecordsByDate: (babyId: string, date: string) => {
    const targetDate = new Date(date).toDateString()
    return get()
      .records.filter((r) => {
        const recordDate = new Date(r.startTime).toDateString()
        return r.babyId === babyId && recordDate === targetDate
      })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  },

  getTodayRecords: (babyId: string) => {
    const today = new Date().toDateString()
    return get()
      .records.filter((r) => {
        const recordDate = new Date(r.startTime).toDateString()
        return r.babyId === babyId && recordDate === today
      })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  },

  getLastRecord: (babyId: string) => {
    const babyRecords = get()
      .records.filter((r) => r.babyId === babyId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    return babyRecords.length > 0 ? babyRecords[0] : null
  },

  clearError: () => set({ error: null }),
}))
