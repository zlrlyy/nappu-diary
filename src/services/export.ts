import { Paths, File } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { Baby, FeedingRecord, DiaperRecord } from '@/types'
import { formatDateTime } from '@/utils/date'

export interface ExportData {
  babies: Baby[]
  feedingRecords: FeedingRecord[]
  diaperRecords: DiaperRecord[]
  exportedAt: string
}

export function prepareExportData(
  babies: Baby[],
  feedingRecords: FeedingRecord[],
  diaperRecords: DiaperRecord[]
): ExportData {
  return {
    babies,
    feedingRecords,
    diaperRecords,
    exportedAt: new Date().toISOString(),
  }
}

export function toJson(data: ExportData): string {
  return JSON.stringify(data, null, 2)
}

export function toCsv(data: ExportData): string {
  const lines: string[] = []

  // Header
  lines.push('Nappu Diary 数据导出')
  lines.push(`导出时间: ${formatDateTime(data.exportedAt)}`)
  lines.push('')

  // Babies
  lines.push('=== 宝宝信息 ===')
  lines.push('ID,名字,出生日期,性别,创建时间')
  data.babies.forEach((baby) => {
    lines.push(
      [
        baby.id,
        baby.name,
        baby.birthDate,
        baby.gender || '',
        baby.createdAt,
      ].join(',')
    )
  })
  lines.push('')

  // Feeding records
  lines.push('=== 喂食记录 ===')
  lines.push('ID,宝宝ID,类型,食量(ml),时长(分钟),喂奶侧,开始时间,结束时间,备注,创建时间')
  data.feedingRecords.forEach((record) => {
    lines.push(
      [
        record.id,
        record.babyId,
        record.type,
        record.amount || '',
        record.duration || '',
        record.breastSide || '',
        record.startTime,
        record.endTime || '',
        record.note ? `"${record.note}"` : '',
        record.createdAt,
      ].join(',')
    )
  })
  lines.push('')

  // Diaper records
  lines.push('=== 排便记录 ===')
  lines.push('ID,宝宝ID,类型,大便性状,时间,备注,创建时间')
  data.diaperRecords.forEach((record) => {
    lines.push(
      [
        record.id,
        record.babyId,
        record.type,
        record.poopConsistency || '',
        record.time,
        record.note ? `"${record.note}"` : '',
        record.createdAt,
      ].join(',')
    )
  })

  return lines.join('\n')
}

export async function exportToFile(
  data: ExportData,
  format: 'json' | 'csv' = 'json'
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `nappu-diary-export-${timestamp}.${format}`
  const file = new File(Paths.cache, fileName)

  const content = format === 'json' ? toJson(data) : toCsv(data)

  await file.write(content)

  return file.uri
}

export async function shareExportedFile(filePath: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync()

  if (!isAvailable) {
    throw new Error('分享功能在此设备上不可用')
  }

  await Sharing.shareAsync(filePath, {
    mimeType: filePath.endsWith('.json') ? 'application/json' : 'text/csv',
    dialogTitle: '导出数据',
  })
}

export async function exportAndShare(
  babies: Baby[],
  feedingRecords: FeedingRecord[],
  diaperRecords: DiaperRecord[],
  format: 'json' | 'csv' = 'json'
): Promise<void> {
  const data = prepareExportData(babies, feedingRecords, diaperRecords)
  const filePath = await exportToFile(data, format)
  await shareExportedFile(filePath)
}
