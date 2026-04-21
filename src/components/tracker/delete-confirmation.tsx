'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DeleteConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  count: number
}

export function DeleteConfirmation({ isOpen, onClose, onConfirm, count }: DeleteConfirmationProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl bg-white">
        <DialogTitle className="sr-only">Delete time entry</DialogTitle>
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-red-50 rounded-full">
              <Trash2 className="h-6 w-6 text-red-500 stroke-[1.2px]" />
            </div>
            <div className="flex-1">
              <h3 className="text-[17px] font-bold text-gray-900 leading-tight">Delete time entry?</h3>
              <p className="mt-2 text-[14px] text-gray-500 leading-relaxed font-normal">
                {count > 1 
                  ? `Are you sure you want to delete ${count} entries? This action will permanently remove them from your log.`
                  : "Are you sure you want to delete this time entry? This action will permanently remove it from your log."}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end px-4 py-4 bg-gray-50/50 space-x-3">
          <Button variant="ghost" onClick={onClose} className="text-gray-500 font-bold uppercase tracking-widest text-[11px] hover:bg-gray-100 px-4">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-widest text-[11px] px-8 py-2 rounded-sm shadow-md">
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
