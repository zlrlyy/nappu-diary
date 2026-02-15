export interface Baby {
  id: string
  name: string
  birthDate: string
  gender?: 'male' | 'female'
  avatar?: string
  createdAt: string
}

export interface CreateBabyInput {
  name: string
  birthDate: string
  gender?: 'male' | 'female'
  avatar?: string
}

export interface UpdateBabyInput {
  name?: string
  birthDate?: string
  gender?: 'male' | 'female'
  avatar?: string
}
