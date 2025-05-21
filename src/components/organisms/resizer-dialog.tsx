import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx'
import { useResizerStore } from '@/stores/resizer-store.tsx'
import { type ComponentPropsWithoutRef, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils.ts'
import { ImageResizer } from '@/components/organisms/image-resizer.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useShallow } from 'zustand/react/shallow'
import { ImageMatch } from '@/components/organisms/image-match.tsx'
import { CanvasManager } from '@/utils/canvas-resizer.ts'
import { CanvasMatcher } from '@/utils/canvas-matcher.ts'

type ResizerDialogProps = {} & ComponentPropsWithoutRef<typeof DialogContent>

export const ResizerDialog = (props: ResizerDialogProps) => {
    const { className, ...rest } = props

    const [open, setOpen, step, setStep] = useResizerStore(
        useShallow((state) => [state.dialogOpen, state.setDialogOpen, state.step, state.setStep]),
    )

    const container = useRef<HTMLDivElement>(null)
    const resizerCanvasManager = useMemo(() => new CanvasManager(), [])
    const matcherCanvasManager = useMemo(() => new CanvasMatcher(), [])

    return (
        <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
            <DialogContent
                className={cn('!max-w-[min(90dvw,_90rem)]', className)}
                ref={container}
                {...rest}
            >
                <DialogHeader>
                    <DialogTitle>Thermographic image settings</DialogTitle>
                    <DialogDescription>
                        Resize the thermographic image to match the circuit board image.
                    </DialogDescription>
                </DialogHeader>
                <div>
                    {step === 'resize' ? (
                        <ImageResizer
                            resizerCanvasManager={resizerCanvasManager}
                            containerRef={container}
                        />
                    ) : null}
                    {step === 'match' ? (
                        <ImageMatch
                            resizerCanvasManager={resizerCanvasManager}
                            matcherCanvasManager={matcherCanvasManager}
                        />
                    ) : null}
                </div>
                <DialogFooter>
                    <Button type="button" onClick={() => setStep('match')}>
                        Next
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
