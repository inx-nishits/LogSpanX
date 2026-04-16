import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

export function parseTime(timeStr: string): number {
  if (!timeStr) return 0
  const parts = timeStr.split(':')
  if (parts.length < 2) return 0
  const hours = parseInt(parts[0], 10) || 0
  const minutes = parseInt(parts[1], 10) || 0
  return (hours * 3600) + (minutes * 60)
}

export function parseTimeAsDate(timeStr: string, baseDate: Date): Date {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i)
  if (!match) return new Date(baseDate)

  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const ampm = match[3]

  if (ampm) {
    if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12
    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0
  }

  const newDate = new Date(baseDate)
  newDate.setHours(hours, minutes, 0, 0)
  return newDate
}

export function formatTimeRange(start: Date, end?: Date): string {
  const format = (d: Date) => {
    try {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase().replace(' ', '')
    } catch (e) {
      return '--:--'
    }
  }
  if (!end) return `${format(start)} - ...`
  return `${format(start)} - ${format(end)}`
}

export function formatDuration(startTime: Date, endTime: Date): string {
  const diff = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
  return formatTime(diff)
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  return weekEnd
}

export function getWeekDates(date: Date): Date[] {
  const weekStart = getWeekStart(date)
  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    dates.push(d)
  }
  return dates
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}
