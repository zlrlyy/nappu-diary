import { FeedingRecord, DiaperRecord } from '@/types'
import { getDaysInWeek, getDaysInMonth, toISODateString } from './date'
import { parseISO, format } from 'date-fns'

export interface DailyStats {
  date: string
  feedingCount: number
  totalAmount: number
  totalDuration: number
  diaperCount: number
  peeCount: number
  poopCount: number
}

export interface FeedingStats {
  totalFeeds: number
  totalAmount: number
  totalDuration: number
  averageInterval: number
  lastFeedTime: string | null
}

export interface DiaperStats {
  totalChanges: number
  peeCount: number
  poopCount: number
  lastChangeTime: string | null
}

export function calculateDailyFeedingStats(records: FeedingRecord[]): DailyStats[] {
  const statsMap = new Map<string, DailyStats>()

  records.forEach((record) => {
    const date = toISODateString(parseISO(record.startTime))
    const existing = statsMap.get(date) || {
      date,
      feedingCount: 0,
      totalAmount: 0,
      totalDuration: 0,
      diaperCount: 0,
      peeCount: 0,
      poopCount: 0,
    }

    existing.feedingCount += 1
    if (record.amount) {
      existing.totalAmount += record.amount
    }
    if (record.duration) {
      existing.totalDuration += record.duration
    }

    statsMap.set(date, existing)
  })

  return Array.from(statsMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function calculateDailyDiaperStats(records: DiaperRecord[]): DailyStats[] {
  const statsMap = new Map<string, DailyStats>()

  records.forEach((record) => {
    const date = toISODateString(parseISO(record.time))
    const existing = statsMap.get(date) || {
      date,
      feedingCount: 0,
      totalAmount: 0,
      totalDuration: 0,
      diaperCount: 0,
      peeCount: 0,
      poopCount: 0,
    }

    existing.diaperCount += 1
    if (record.type === 'pee') {
      existing.peeCount += 1
    } else if (record.type === 'poop') {
      existing.poopCount += 1
    } else if (record.type === 'both') {
      existing.peeCount += 1
      existing.poopCount += 1
    }

    statsMap.set(date, existing)
  })

  return Array.from(statsMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function calculateFeedingStats(records: FeedingRecord[]): FeedingStats {
  if (records.length === 0) {
    return {
      totalFeeds: 0,
      totalAmount: 0,
      totalDuration: 0,
      averageInterval: 0,
      lastFeedTime: null,
    }
  }

  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )

  const totalFeeds = records.length
  const totalAmount = records.reduce((sum, r) => sum + (r.amount || 0), 0)
  const totalDuration = records.reduce((sum, r) => sum + (r.duration || 0), 0)

  // Calculate average interval
  let totalInterval = 0
  let intervalCount = 0
  for (let i = 1; i < sortedRecords.length; i++) {
    const prev = parseISO(sortedRecords[i - 1].startTime)
    const curr = parseISO(sortedRecords[i].startTime)
    const interval = (curr.getTime() - prev.getTime()) / (1000 * 60) // minutes
    totalInterval += interval
    intervalCount++
  }
  const averageInterval = intervalCount > 0 ? totalInterval / intervalCount : 0

  const lastFeedTime = sortedRecords[sortedRecords.length - 1]?.startTime || null

  return {
    totalFeeds,
    totalAmount,
    totalDuration,
    averageInterval,
    lastFeedTime,
  }
}

export function calculateDiaperStats(records: DiaperRecord[]): DiaperStats {
  if (records.length === 0) {
    return {
      totalChanges: 0,
      peeCount: 0,
      poopCount: 0,
      lastChangeTime: null,
    }
  }

  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  )

  let peeCount = 0
  let poopCount = 0
  records.forEach((r) => {
    if (r.type === 'pee') peeCount++
    else if (r.type === 'poop') poopCount++
    else if (r.type === 'both') {
      peeCount++
      poopCount++
    }
  })

  return {
    totalChanges: records.length,
    peeCount,
    poopCount,
    lastChangeTime: sortedRecords[sortedRecords.length - 1]?.time || null,
  }
}

export function getWeeklyFeedingData(records: FeedingRecord[]): { day: string; count: number }[] {
  const days = getDaysInWeek()
  const dayNames = ['一', '二', '三', '四', '五', '六', '日']

  return days.map((day, index) => {
    const dayStr = toISODateString(day)
    const dayRecords = records.filter((r) => {
      const recordDate = toISODateString(parseISO(r.startTime))
      return recordDate === dayStr
    })

    return {
      day: `周${dayNames[index]}`,
      count: dayRecords.length,
    }
  })
}

export function getWeeklyDiaperData(records: DiaperRecord[]): { day: string; count: number }[] {
  const days = getDaysInWeek()
  const dayNames = ['一', '二', '三', '四', '五', '六', '日']

  return days.map((day, index) => {
    const dayStr = toISODateString(day)
    const dayRecords = records.filter((r) => {
      const recordDate = toISODateString(parseISO(r.time))
      return recordDate === dayStr
    })

    return {
      day: `周${dayNames[index]}`,
      count: dayRecords.length,
    }
  })
}

export function getMonthlyFeedingData(
  records: FeedingRecord[]
): { date: string; count: number }[] {
  const days = getDaysInMonth()

  return days.map((day) => {
    const dayStr = toISODateString(day)
    const dayRecords = records.filter((r) => {
      const recordDate = toISODateString(parseISO(r.startTime))
      return recordDate === dayStr
    })

    return {
      date: format(day, 'M/d'),
      count: dayRecords.length,
    }
  })
}

export function getMonthlyDiaperData(
  records: DiaperRecord[]
): { date: string; count: number }[] {
  const days = getDaysInMonth()

  return days.map((day) => {
    const dayStr = toISODateString(day)
    const dayRecords = records.filter((r) => {
      const recordDate = toISODateString(parseISO(r.time))
      return recordDate === dayStr
    })

    return {
      date: format(day, 'M/d'),
      count: dayRecords.length,
    }
  })
}
