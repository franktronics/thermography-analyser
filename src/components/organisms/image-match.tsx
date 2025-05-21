import { useEffect, useRef } from 'react'
import { CanvasManager } from '@/utils/canvas-resizer.ts'
import { CanvasMatcher } from '@/utils/canvas-matcher.ts'
import { useImagesStore } from '@/stores/images-store.tsx'
import { useShallow } from 'zustand/react/shallow'

type ImageMatchprops = {
    onPointsChange?: (points: { x: number; y: number }[]) => void
    resizerCanvasManager: CanvasManager
    matcherCanvasManager: CanvasMatcher
}
export const ImageMatch = (props: ImageMatchprops) => {
    const { resizerCanvasManager, matcherCanvasManager } = props

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [imgThermoElt, imgBoardElt] = useImagesStore(
        useShallow((state) => [state.imgThermoElt, state.imgBoardElt]),
    )

    useEffect(() => {
        if (!canvasRef.current || !imgBoardElt || !imgThermoElt) return
        matcherCanvasManager.setCanvas(canvasRef.current)
        matcherCanvasManager.setBoardImage(imgBoardElt)
        resizerCanvasManager.getExtractedImgElt(500, (imgElt) => {
            matcherCanvasManager.setThermoImage(imgElt)
        })
    }, [canvasRef, imgBoardElt])

    if (!imgBoardElt) return null

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={resizerCanvasManager.containerWidth - 25 * 2}
                height={
                    (imgBoardElt.height / imgBoardElt.width) *
                    (resizerCanvasManager.containerWidth - 25 * 2)
                }
                style={{
                    border: '1px solid #f00',
                    maxWidth: '100%',
                    height: 'auto',
                }}
            />
        </div>
    )
}
