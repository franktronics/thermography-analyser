import type React from 'react'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils.ts'

interface DropZoneProps {
    id: string
    label: string
    image: string | null
    onImageUpload: (imageDataUrl: string) => void
    onImageRemove: () => void
}

export function DropZone({ id, label, image, onImageUpload, onImageRemove }: DropZoneProps) {
    // Handle file drops
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }

    // Handle file input change
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    // Process the file
    const handleFile = (file: File) => {
        if (!file.type.match('image.*')) return

        const reader = new FileReader()
        reader.onload = (event) => {
            if (event.target && typeof event.target.result === 'string') {
                onImageUpload(event.target.result)
            }
        }
        reader.readAsDataURL(file)
    }

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-lg px-4',
                'border-2 border-dashed hover:border-primary',
                "h-[9rem]",
                { 'border-primary bg-primary-foreground': !!image },
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <input
                type="file"
                id={id}
                className="hidden w-full h-full"
                accept="image/*"
                onChange={handleFileInputChange}
            />

            {image ? (
                <div className="text-center h-full w-full grid grid-rows-[minmax(0,_2fr)_minmax(0,_1fr)] justify-items-center">
                    <div className="relative aspect-square">
                        <img
                            src={image || '/placeholder.svg'}
                            alt="Uploaded image"
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <Button variant="secondary" size="sm" className="w-fit" onClick={onImageRemove}>
                        Remove
                    </Button>
                </div>
            ) : (
                <label htmlFor={id} className="cursor-pointer text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">or click to browse</p>
                </label>
            )}
        </div>
    )
}
