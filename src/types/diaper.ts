export type DiaperType = 'pee' | 'poop' | 'both'
export type PoopConsistency = 'normal' | 'loose' | 'hard' | 'mucus' | 'bloody'

export interface DiaperRecord {
  id: string
  babyId: string
  type: DiaperType
  poopConsistency?: PoopConsistency
  time: string
  note?: string
  createdAt: string
}

export interface CreateDiaperInput {
  babyId: string
  type: DiaperType
  poopConsistency?: PoopConsistency
  time: string
  note?: string
}

export interface UpdateDiaperInput {
  type?: DiaperType
  poopConsistency?: PoopConsistency
  time?: string
  note?: string
}
