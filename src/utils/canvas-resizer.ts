import cv from '@techstark/opencv-js'

interface Point {
    x: number
    y: number
}

export class CanvasManager {
    private points: Point[] = []
    private canvas: HTMLCanvasElement | null = null
    private ctx: CanvasRenderingContext2D | null = null
    private isDragging: boolean = false
    private selectedPoint: number = -1
    private image: HTMLImageElement | null = null
    public containerWidth: number = 0

    constructor() {}

    private initializePoints(w: number, h: number) {
        const defaultWidth = w
        const defaultHeight = h
        const margin = 50 // Margin from borders

        this.points = [
            { x: margin, y: margin }, // Top-left
            { x: defaultWidth - margin, y: margin }, // Top-right
            { x: defaultWidth - margin, y: defaultHeight - margin }, // Bottom-right
            { x: margin, y: defaultHeight - margin }, // Bottom-left
        ]
    }

    public setCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.removeEventListeners()
        this.addEventListeners()
    }

    public setImage(imgElt: HTMLImageElement) {
        this.image = imgElt
        this.initializePoints(this.canvas!.width, this.canvas!.height)
        this.draw()
    }

    private draw() {
        if (!this.ctx || !this.canvas) return

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        // Draw gray background
        this.ctx.fillStyle = '#e0e0e0'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        // Draw image if available
        if (this.image) {
            this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height)
        }

        // Draw lines between points to form a rectangle
        this.ctx.beginPath()
        this.ctx.moveTo(this.points[0].x, this.points[0].y)
        for (let i = 1; i <= this.points.length; i++) {
            const point = this.points[i % this.points.length]
            this.ctx.lineTo(point.x, point.y)
        }
        this.ctx.strokeStyle = '#0000ff'
        this.ctx.lineWidth = 2
        this.ctx.stroke()

        // Draw corner points
        this.points.forEach((point) => {
            this.ctx!.fillStyle = 'transparent'
            this.ctx!.strokeStyle = '#ff0000'
            this.ctx!.lineWidth = 1
            this.ctx!.fillRect(point.x - 5, point.y - 5, 10, 10)
            this.ctx!.strokeRect(point.x - 5, point.y - 5, 10, 10)
        })
    }

    private removeEventListeners() {
        if (!this.canvas) return
        this.canvas.removeEventListener('mousedown', this.handleMouseDown)
        this.canvas.removeEventListener('mousemove', this.handleMouseMove)
        this.canvas.removeEventListener('mouseup', this.handleMouseUp)
        document.removeEventListener('mouseup', this.handleMouseUp)
    }

    private addEventListeners() {
        if (!this.canvas) return
        this.canvas.addEventListener('mousedown', this.handleMouseDown)
        this.canvas.addEventListener('mousemove', this.handleMouseMove)
        this.canvas.addEventListener('mouseup', this.handleMouseUp)
        document.addEventListener('mouseup', this.handleMouseUp)
    }

    private getMousePosition(e: MouseEvent): Point {
        const rect = this.canvas!.getBoundingClientRect()
        const scaleX = this.canvas!.width / rect.width
        const scaleY = this.canvas!.height / rect.height

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        }
    }

    private handleMouseDown = (e: MouseEvent) => {
        const mousePos = this.getMousePosition(e)

        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i]
            const distance = Math.sqrt(
                Math.pow(point.x - mousePos.x, 2) + Math.pow(point.y - mousePos.y, 2),
            )

            if (distance < 10) {
                this.isDragging = true
                this.selectedPoint = i
                break
            }
        }
    }

    private handleMouseMove = (e: MouseEvent) => {
        if (!this.isDragging) return

        const mousePos = this.getMousePosition(e)
        this.points[this.selectedPoint] = mousePos
        this.draw()
    }

    private handleMouseUp = () => {
        this.isDragging = false
        this.selectedPoint = -1
        this.draw()
    }

    public extractSquareImage(targetSize: number = 500): HTMLCanvasElement | null {
        if (!this.canvas || !this.image || this.points.length !== 4) return null

        try {
            // Create destination points for a square image
            const dstPoints = [
                { x: 0, y: 0 }, // Top-left
                { x: targetSize, y: 0 }, // Top-right
                { x: targetSize, y: targetSize }, // Bottom-right
                { x: 0, y: targetSize }, // Bottom-left
            ]

            // Convert source points to OpenCV format
            const srcMat = cv.matFromArray(4, 1, cv.CV_32FC2, [
                this.points[0].x,
                this.points[0].y, // Top-left
                this.points[1].x,
                this.points[1].y, // Top-right
                this.points[2].x,
                this.points[2].y, // Bottom-right
                this.points[3].x,
                this.points[3].y, // Bottom-left
            ])

            // Convert destination points to OpenCV format
            const dstMat = cv.matFromArray(4, 1, cv.CV_32FC2, [
                dstPoints[0].x,
                dstPoints[0].y,
                dstPoints[1].x,
                dstPoints[1].y,
                dstPoints[2].x,
                dstPoints[2].y,
                dstPoints[3].x,
                dstPoints[3].y,
            ])

            // Create temporary canvas to get image data
            const tempCanvas = document.createElement('canvas')
            tempCanvas.width = this.canvas.width
            tempCanvas.height = this.canvas.height
            const tempCtx = tempCanvas.getContext('2d')
            if (!tempCtx) return null
            tempCtx.drawImage(this.image, 0, 0, tempCanvas.width, tempCanvas.height)

            // Convert image to OpenCV format
            const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
            const src = cv.matFromImageData(imgData)

            // Create output matrix
            const dst = new cv.Mat()
            const dsize = new cv.Size(targetSize, targetSize)

            // Calculate perspective transform matrix
            const perspectiveMatrix = cv.getPerspectiveTransform(srcMat, dstMat)

            // Apply perspective transform
            cv.warpPerspective(
                src,
                dst,
                perspectiveMatrix,
                dsize,
                cv.INTER_LINEAR,
                cv.BORDER_CONSTANT,
                new cv.Scalar(),
            )

            // Create output canvas
            const outputCanvas = document.createElement('canvas')
            outputCanvas.width = targetSize
            outputCanvas.height = targetSize

            // Convert OpenCV matrix back to canvas
            cv.imshow(outputCanvas, dst)

            // Cleanup
            src.delete()
            dst.delete()
            srcMat.delete()
            dstMat.delete()
            perspectiveMatrix.delete()

            return outputCanvas
        } catch (error) {
            console.error('Error in extractSquareImage:', error)
            return null
        }
    }

    public getExtractedImageUrl(targetSize: number = 500): string | null {
        const canvas = this.extractSquareImage(targetSize)
        if (!canvas) return null
        return canvas.toDataURL('image/jpeg')
    }

    public getExtractedImgElt(targetSize: number = 500, cb: (elt: HTMLImageElement) => void) {
        const canvas = this.extractSquareImage(targetSize)
        if (!canvas) return null
        const img = new Image()
        img.onload = () => {
            cb(img)
        }
        img.src = canvas.toDataURL('image/jpeg')
    }

    public extractImageBorder(): string | null {
        if (!this.canvas || !this.image) return null
        if (this.points[0].x > this.canvas?.width - this.points[1].x) {
            return this.cutImage(Math.min(this.points[0].x, this.points[3].x), 'left')
        } else {
            return this.cutImage(Math.max(this.points[1].x, this.points[2].x), 'right')
        }
    }

    public cutImage(cutX: number, preserve: 'left' | 'right'): string | null {
        if (!this.canvas || !this.image) return null

        try {
            // Validate cutX
            if (cutX <= 0 || cutX >= this.canvas.width) {
                console.error('Invalid cut position')
                return null
            }

            // Create temporary canvas
            const tempCanvas = document.createElement('canvas')
            const tempCtx = tempCanvas.getContext('2d')
            if (!tempCtx) return null

            // Set dimensions based on preserved side
            tempCanvas.width = preserve === 'left' ? cutX : this.canvas.width - cutX
            tempCanvas.height = this.canvas.height

            // D'abord, créons un canvas intermédiaire avec l'image complète
            const intermediateCanvas = document.createElement('canvas')
            intermediateCanvas.width = this.canvas.width
            intermediateCanvas.height = this.canvas.height
            const intermediateCtx = intermediateCanvas.getContext('2d')
            if (!intermediateCtx) return null

            // Dessiner l'image complète sur le canvas intermédiaire
            intermediateCtx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height)

            // Maintenant, copier la portion souhaitée vers le canvas final
            if (preserve === 'left') {
                tempCtx.drawImage(
                    intermediateCanvas,
                    0, // source x
                    0, // source y
                    cutX, // source width
                    this.canvas.height, // source height
                    0, // destination x
                    0, // destination y
                    cutX, // destination width
                    this.canvas.height, // destination height
                )
            } else {
                tempCtx.drawImage(
                    intermediateCanvas,
                    cutX, // source x
                    0, // source y
                    this.canvas.width - cutX, // source width
                    this.canvas.height, // source height
                    0, // destination x
                    0, // destination y
                    this.canvas.width - cutX, // destination width
                    this.canvas.height, // destination height
                )
            }

            // Pour déboguer, vérifions que le canvas n'est pas vide
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
            const hasData = imageData.data.some((channel) => channel !== 0)
            if (!hasData) {
                console.error('Canvas is empty after drawing')
            }

            return tempCanvas.toDataURL('image/jpeg', 1.0) // Qualité maximale
        } catch (error) {
            console.error('Error in cutImage:', error)
            return null
        }
    }
}
