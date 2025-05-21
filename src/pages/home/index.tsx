import { DropZone } from '@/components/molecules/drop-zone.tsx'
import { useImagesStore } from '@/stores/images-store.tsx'
import { useShallow } from 'zustand/react/shallow'
import { ResizerDialog } from '@/components/organisms/resizer-dialog.tsx'

export default function HomePage() {
    const state = useImagesStore(useShallow((state) => state))
    return (
        <main className="grid grid-cols-[2fr_1fr] gap-4">
            <section className="bg-amber-300">canvas</section>
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
