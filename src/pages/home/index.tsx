import { DropZone } from '@/components/molecules/drop-zone.tsx'
import { useImagesStore } from '@/stores/images-store.tsx'
import { useShallow } from 'zustand/react/shallow'
import { ResizerDialog } from '@/components/organisms/resizer-dialog.tsx'
import { useEffect, useRef, useState } from 'react'
import { useCanvasStore } from '@/stores/canvas-store.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Slider } from '@/components/ui/slider.tsx'

export default function HomePage() {
    const state = useImagesStore(useShallow((state) => state))
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const canvasColorRef = useRef<HTMLCanvasElement>(null)
    const container = useRef<HTMLDivElement>(null)
    const colorVisual = useRef<HTMLDivElement>(null)
    const [locked, setLocked] = useState(false)
    const [opacity, setOpacity] = useState(50)
    const [saved, resizerCanvasManager, matcherCanvasManager, colorCanvasManager] = useCanvasStore(
        useShallow((state) => [
            state.saved,
            state.resizerCanvasManager,
            state.matcherCanvasManager,
            state.colorCanvasManager,
        ]),
    )
    const imgBoardElt = useImagesStore(useShallow((state) => state.imgBoardElt))

    useEffect(() => {
        if (!canvasRef.current || !imgBoardElt) return
        matcherCanvasManager.setCanvas(canvasRef.current)
        matcherCanvasManager.draw()
        matcherCanvasManager.setColorPickerHandler((color) => {
            if (colorVisual.current) {
                colorVisual.current.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`
            }
            if (canvasColorRef.current) {
                colorCanvasManager.setBarByColor(color)
            }
        })

        if (!canvasColorRef.current) return
        colorCanvasManager.setCanvas(canvasColorRef.current)
        const colorImg = resizerCanvasManager.extractImageBorder()

        if (!colorImg) return
        const image = new Image()
        image.onload = () => {
            colorCanvasManager.setImage(image)
        }
        image.src = colorImg
    }, [saved])

    return (
        <main className="grid grid-cols-[2fr_1fr] gap-4">
            <section className="space-y-4" ref={container}>
                {container.current && imgBoardElt && saved ? (
                    <>
                        <canvas
                            ref={canvasRef}
                            width={container.current.offsetWidth}
                            height={
                                (imgBoardElt.height / imgBoardElt.width) *
                                container.current.offsetWidth
                            }
                            style={{
                                border: '1px solid #f00',
                                maxWidth: '100%',
                                height: 'auto',
                            }}
                        />
                        <div className="flex items-center gap-x-6">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="canva-lock"
                                    checked={locked}
                                    onCheckedChange={(v) => {
                                        setLocked(v)
                                        matcherCanvasManager.setLock(v)
                                    }}
                                />
                                <Label htmlFor="canva-lock">Lock position</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="opacity-slider">Opacity</Label>
                                <Slider
                                    id="opacity-slider"
                                    defaultValue={[50]}
                                    value={[opacity]}
                                    onValueChange={(v) => {
                                        setOpacity(v[0])
                                        matcherCanvasManager.setOpacity(v[0] / 100)
                                    }}
                                    max={100}
                                    step={1}
                                    className="w-[5rem]"
                                />
                            </div>
                        </div>
                        <div className="bg-secondary h-16 w-full" ref={colorVisual}></div>
                    </>
                ) : (
                    <div className="bg-secondary flex h-full w-full items-center justify-center">
                        <p className="text-foreground text-center">
                            Please upload the images to start
                        </p>
                    </div>
                )}
            </section>
            <aside className="space-y-4">
                <div className="space-y-2">
                    <h2 className="text-xl leading-none font-semibold tracking-tight">
                        Circuit board image
                    </h2>
                    <DropZone
                        id="drop-zone-1"
                        label="Drop the circuit board image here"
                        image={state.imgBoard}
                        onImageUpload={state.setImgBoard}
                        onImageRemove={state.resetImgBoard}
                    />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl leading-none font-semibold tracking-tight">
                        Thermographic image
                    </h2>
                    <DropZone
                        id="drop-zone-2"
                        label="Drop the thermographic image here"
                        image={state.imgThermo}
                        onImageUpload={state.setImgThermo}
                        onImageRemove={state.resetImgThermo}
                    />
                </div>
                <ResizerDialog />
                <div>
                    <canvas
                        ref={canvasColorRef}
                        width={100}
                        height={200}
                        style={{
                            border: '1px solid #f00',
                            maxWidth: '100%',
                            height: 'auto',
                        }}
                    />
                </div>
            </aside>
        </main>
    )
}
