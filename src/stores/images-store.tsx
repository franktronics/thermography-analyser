import { create } from 'zustand'
import { useResizerStore } from '@/stores/resizer-store.tsx'

interface ImagesStore {
    imgBoard: string | null
    imgThermo: string | null
    imgBoardElt: HTMLImageElement | null
    imgThermoElt: HTMLImageElement | null
    setImgBoard: (imgBoard: string) => void
    setImgThermo: (imgThermo: string) => void
    resetImgBoard: () => void
    resetImgThermo: () => void
}

export const useImagesStore = create<ImagesStore>()((set) => ({
    imgBoard: null,
    imgThermo: null,
    imgBoardElt: null,
    imgThermoElt: null,
    setImgBoard: (imgBoard: string) => {
        const image = new Image()
        image.onload = () => {
            set({ imgBoardElt: image })
        }
        image.src = imgBoard
        set({ imgBoard })
    },
    setImgThermo: (imgThermo: string) => {
        const image = new Image()
        image.onload = () => {
            set({ imgThermoElt: image })
            useResizerStore.getState().setDialogOpen(true)
        }
        image.src = imgThermo
        set({ imgThermo })
    },
    resetImgBoard: () => set({ imgBoard: null, imgBoardElt: null }),
    resetImgThermo: () => set({ imgThermo: null, imgThermoElt: null }),
}))
