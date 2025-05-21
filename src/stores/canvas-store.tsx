import { create } from 'zustand'
import { CanvasManager } from '@/utils/canvas-resizer.ts'
import { CanvasMatcher } from '@/utils/canvas-matcher.ts'
import { CanvasColor } from '@/utils/canvas-color.ts'

interface CanvasStore {
    resizerCanvasManager: CanvasManager
    matcherCanvasManager: CanvasMatcher
    colorCanvasManager: CanvasColor
    saved: boolean
    setSaved: (saved: boolean) => void
}

export const useCanvasStore = create<CanvasStore>()((set) => ({
    resizerCanvasManager: new CanvasManager(),
    matcherCanvasManager: new CanvasMatcher(),
    colorCanvasManager: new CanvasColor(),
    saved: false,
    setSaved: (saved: boolean) => set({ saved }),
}))
