import {
  format,
  formatDistanceToNow,
  parseISO,
  isToday,
  isYesterday,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  differenceInMinutes,
  differenceInHours,
} from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function formatDate(date: string | Date, formatStr: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr, { locale: zhCN })
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm', { locale: zhCN })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'yyyy-MM-dd HH:mm', { locale: zhCN })
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date

  if (isToday(d)) {
    return `今天 ${formatTime(d)}`
  }

  if (isYesterday(d)) {
    return `昨天 ${formatTime(d)}`
  }

  return formatDateTime(d)
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} 分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`
}

export function getTimeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: zhCN })
}

export function getMinutesAgo(date: string | Date): number {
  const d = typeof date === 'string' ? parseISO(date) : date
  return differenceInMinutes(new Date(), d)
}

export function getHoursAgo(date: string | Date): number {
  const d = typeof date === 'string' ? parseISO(date) : date
  return differenceInHours(new Date(), d)
}

export function getDayStart(date: Date = new Date()): Date {
  return startOfDay(date)
}

export function getDayEnd(date: Date = new Date()): Date {
  return endOfDay(date)
}

export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

export function getWeekEnd(date: Date = new Date()): Date {
  return endOfWeek(date, { weekStartsOn: 1 })
}

export function getMonthStart(date: Date = new Date()): Date {
  return startOfMonth(date)
}

export function getMonthEnd(date: Date = new Date()): Date {
  return endOfMonth(date)
}

export function getDaysInWeek(date: Date = new Date()): Date[] {
  return eachDayOfInterval({
    start: getWeekStart(date),
    end: getWeekEnd(date),
  })
}

export function getDaysInMonth(date: Date = new Date()): Date[] {
  return eachDayOfInterval({
    start: getMonthStart(date),
    end: getMonthEnd(date),
  })
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function toISOString(date: Date): string {
  return date.toISOString()
}
