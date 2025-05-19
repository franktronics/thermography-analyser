import { useState } from 'react'
import { DropZone } from '@/components/molecules/drop-zone.tsx'

export default function HomePage() {
    const [firstImage, setFirstImage] = useState<string | null>(null)
    return (
        <main>
            work
            <DropZone
                id="drop-zone-1"
                label="Drop first image here"
                image={firstImage}
                onImageUpload={(imageDataUrl: string) => {
                    setFirstImage(imageDataUrl)
                }}
                onImageRemove={() => setFirstImage(null)}
            />
        </main>
    )
}
