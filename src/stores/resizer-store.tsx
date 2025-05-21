import { create } from 'zustand'

interface ResizerStore {
    dialogOpen: boolean
    setDialogOpen: (open: boolean) => void
    step: 'resize' | 'match'
    setStep: (open: 'resize' | 'match') => void
}

export const useResizerStore = create<ResizerStore>()((set) => ({
    dialogOpen: false,
    setDialogOpen: (open: boolean) => set({ dialogOpen: open }),
    step: 'resize',
    setStep: (step: ResizerStore['step']) => set({ step }),
}))
