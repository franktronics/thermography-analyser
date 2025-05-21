import { create } from 'zustand'
import { CanvasManager } from '@/utils/canvas-resizer.ts'
import { CanvasMatcher } from '@/utils/canvas-matcher.ts'

interface CanvasStore {
    resizerCanvasManager: CanvasManager
    matcherCanvasManager: CanvasMatcher
    saved: boolean
    setSaved: (saved: boolean) => void
}

export const useCanvasStore = create<CanvasStore>()((set) => ({
    resizerCanvasManager: new CanvasManager(),
    matcherCanvasManager: new CanvasMatcher(),
    saved: false,
    setSaved: (saved: boolean) => set({ saved }),
}))
