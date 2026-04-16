import { create } from 'zustand'
import { TimerState, TimeEntry } from '@/lib/types'
import { generateId } from '@/lib/utils'

interface TimerStore extends TimerState {
  startTimer: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  stopTimer: () => void
  updateCurrentEntry: (updates: Partial<TimeEntry>) => void
  resetTimer: () => void
  getElapsedTime: () => number
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  isRunning: false,
  currentEntry: undefined,
  startTime: undefined,

  startTimer: (entry) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    set({
      isRunning: true,
      currentEntry: newEntry,
      startTime: new Date()
    })
  },

  stopTimer: () => {
    const { currentEntry, startTime } = get()
    if (currentEntry && startTime) {
      const endTime = new Date()
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
      set({
        isRunning: false,
        currentEntry: {
          ...currentEntry,
          endTime,
          duration,
          updatedAt: endTime
        },
        startTime: undefined
      })
    }
  },

  updateCurrentEntry: (updates) => {
    const { currentEntry } = get()
    if (currentEntry) {
      set({
        currentEntry: {
          ...currentEntry,
          ...updates,
          updatedAt: new Date()
        }
      })
    }
  },

  resetTimer: () => {
    set({
      isRunning: false,
      currentEntry: undefined,
      startTime: undefined
    })
  },

  getElapsedTime: () => {
    const { startTime } = get()
    if (!startTime) return 0
    return Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
  }
}))
