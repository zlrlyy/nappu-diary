export type FeedingType = 'breast_direct' | 'breast_bottle' | 'formula'
export type BreastSide = 'left' | 'right' | 'both'

export interface FeedingRecord {
  id: string
  babyId: string
  type: FeedingType
  amount?: number
  duration?: number
  breastSide?: BreastSide
  startTime: string
  endTime?: string
  note?: string
  createdAt: string
}

export interface CreateFeedingInput {
  babyId: string
  type: FeedingType
  amount?: number
  duration?: number
  breastSide?: BreastSide
  startTime: string
  endTime?: string
  note?: string
}

export interface UpdateFeedingInput {
  type?: FeedingType
  amount?: number
  duration?: number
  breastSide?: BreastSide
  startTime?: string
  endTime?: string
  note?: string
}
