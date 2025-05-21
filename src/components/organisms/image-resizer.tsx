import { type RefObject, useEffect, useRef, useState } from 'react'
import type { CanvasManager } from '@/utils/canvas-resizer.ts'
import { useImagesStore } from '@/stores/images-store.tsx'
import { useShallow } from 'zustand/react/shallow'

type ImageResizerprops = {
    onPointsChange?: (points: { x: number; y: number }[]) => void
    containerRef: RefObject<HTMLDivElement | null>
    resizerCanvasManager: CanvasManager
}
export const ImageResizer = (props: ImageResizerprops) => {
    const { containerRef, resizerCanvasManager } = props

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [cw, setCw] = useState(0)
    const imgThermoElt = useImagesStore(useShallow((state) => state.imgThermoElt))

    useEffect(() => {
        if (containerRef.current) {
            setCw(containerRef.current.offsetWidth)
            resizerCanvasManager.containerWidth = containerRef.current.offsetWidth
        }
        if (imgThermoElt && canvasRef.current && containerRef.current) {
            resizerCanvasManager.setCanvas(canvasRef.current)
            resizerCanvasManager.setImage(imgThermoElt)
        }
    }, [imgThermoElt, resizerCanvasManager, containerRef.current])

    if (!imgThermoElt) return null

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={cw - 25 * 2}
                height={(imgThermoElt.height / imgThermoElt.width) * (cw - 25 * 2)}
                style={{
                    border: '1px solid #f00',
                    maxWidth: '100%',
                    height: 'auto',
                }}
            />
        </div>
    )
}
