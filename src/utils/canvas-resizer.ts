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

        // Corner points
        this.points = [
            { x: margin, y: margin }, // Top-left
            { x: defaultWidth - margin, y: margin }, // Top-right
            { x: defaultWidth - margin, y: defaultHeight - margin }, // Bottom-right
            { x: margin, y: defaultHeight - margin }, // Bottom-left
        ]

        this.addMiddlePoints()
    }

    private addMiddlePoints() {
        const newPoints: Point[] = []
        for (let i = 0; i < 4; i++) {
            const current = this.points[i]
            const next = this.points[(i + 1) % 4]

            newPoints.push({
                x: current.x + (next.x - current.x) / 3,
                y: current.y + (next.y - current.y) / 3,
            })
            newPoints.push({
                x: current.x + (2 * (next.x - current.x)) / 3,
                y: current.y + (2 * (next.y - current.y)) / 3,
            })
        }

        for (let i = 0; i < newPoints.length; i += 2) {
            this.points.splice(i + 1 + i / 2, 0, newPoints[i], newPoints[i + 1])
        }
    }

    public setCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.removeEventListeners() // Remove any existing listeners
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

        // Draw lines between points
        this.ctx.beginPath()
        this.ctx.moveTo(this.points[0].x, this.points[0].y)
        for (let i = 1; i <= this.points.length; i++) {
            const point = this.points[i % this.points.length]
            this.ctx.lineTo(point.x, point.y)
        }
        this.ctx.strokeStyle = '#0000ff'
        this.ctx.lineWidth = 2
        this.ctx.stroke()

        // Draw points
        this.points.forEach((point) => {
            this.ctx!.fillStyle = 'transparent'
            this.ctx!.strokeStyle = '#ff0000'
            this.ctx!.lineWidth = 1

            // Draw filled square with white border
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
        // Add document-level mouseup to handle cases where mouse is released outside canvas
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
        if (!this.canvas || !this.image || this.points.length !== 12) return null

        try {
            // Create source and destination points for perspective transform
            const srcPoints = [
                this.points[0], // Top-left
                this.points[3], // Top-right
                this.points[6], // Bottom-right
                this.points[9], // Bottom-left
            ]

            // Create destination points for a square image
            const dstPoints = [
                { x: 0, y: 0 }, // Top-left
                { x: targetSize, y: 0 }, // Top-right
                { x: targetSize, y: targetSize }, // Bottom-right
                { x: 0, y: targetSize }, // Bottom-left
            ]

            // Convert source points to OpenCV format
            const srcMat = cv.matFromArray(4, 1, cv.CV_32FC2, [
                srcPoints[0].x,
                srcPoints[0].y,
                srcPoints[1].x,
                srcPoints[1].y,
                srcPoints[2].x,
                srcPoints[2].y,
                srcPoints[3].x,
                srcPoints[3].y,
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
}
