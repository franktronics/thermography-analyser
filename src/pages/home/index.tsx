import { DropZone } from '@/components/molecules/drop-zone.tsx'
import { useImagesStore } from '@/stores/images-store.tsx'
import { useShallow } from 'zustand/react/shallow'
import { ResizerDialog } from '@/components/organisms/resizer-dialog.tsx'
import { useEffect, useRef, useState } from 'react'
import { useCanvasStore } from '@/stores/canvas-store.ts'
import { Switch } from '@/components/ui/switch.tsx'
import { Label } from '@/components/ui/label.tsx'

export default function HomePage() {
    const state = useImagesStore(useShallow((state) => state))
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const container = useRef<HTMLDivElement>(null)
    const [locked, setLocked] = useState(false)
    const [saved, matcherCanvasManager] = useCanvasStore(
        useShallow((state) => [state.saved, state.matcherCanvasManager]),
    )
    const imgBoardElt = useImagesStore(useShallow((state) => state.imgBoardElt))

    useEffect(() => {
        if (!canvasRef.current || !imgBoardElt) return
        matcherCanvasManager.setCanvas(canvasRef.current)
        matcherCanvasManager.draw()
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
            </aside>
        </main>
    )
}
