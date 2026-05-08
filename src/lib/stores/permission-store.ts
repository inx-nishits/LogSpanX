import { create } from 'zustand'

interface PermissionStore {
  isOpen: boolean
  show: () => void
  hide: () => void
}

export const usePermissionStore = create<PermissionStore>((set) => ({
  isOpen: false,
  show: () => set({ isOpen: true }),
  hide: () => set({ isOpen: false }),
}))
