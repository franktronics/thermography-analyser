interface Point {
    x: number
    y: number
}

interface Rect {
    x: number
    y: number
    width: number
    height: number
}

export class CanvasMatcher {
    private canvas: HTMLCanvasElement | null = null
    private ctx: CanvasRenderingContext2D | null = null
    private boardImage: HTMLImageElement | null = null
    private thermoImage: HTMLImageElement | null = null
    private thermoRect: Rect = { x: 0, y: 0, width: 0, height: 0 }
    private thermoImgOpacity: number = 0.5
    private isDragging: boolean = false
    private isResizing: boolean = false
    private selectedHandle: string | null = null
    private lastMousePos: Point = { x: 0, y: 0 }
    private padding: number = 5 // Padding between image and resize handles
    private locked: boolean = false
    private handleColorPicker: ((color: { r: number; g: number; b: number }) => void) | null = null
    private showCrosshair: boolean = false
    private crosshairPos: Point = { x: 0, y: 0 }

    constructor() {
        this.thermoImgOpacity = 0.5
        this.locked = false
    }

    public setColorPickerHandler(
        handler: ((color: { r: number; g: number; b: number }) => void) | null,
    ) {
        this.handleColorPicker = handler
    }

    public setLock(locked: boolean) {
        this.locked = locked
        this.draw()
    }

    public setCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.removeEventListeners()
        this.addEventListeners()
    }

    public setBoardImage(imgElt: HTMLImageElement) {
        this.boardImage = imgElt
        this.draw()
    }

    public setThermoImage(imgElt: HTMLImageElement) {
        this.thermoImage = imgElt
        // Initialize thermoRect at center with reasonable size
        if (this.canvas) {
            const ratio = imgElt.width / imgElt.height
            const initialHeight = this.canvas.height / 3
            this.thermoRect = {
                width: initialHeight * ratio,
                height: initialHeight,
                x: (this.canvas.width - initialHeight * ratio) / 2,
                y: (this.canvas.height - initialHeight) / 2,
            }
        }
        this.draw()
    }

    public setOpacity(opacity: number) {
        this.thermoImgOpacity = Math.max(0, Math.min(1, opacity))
        this.draw()
    }

    public draw() {
        if (!this.ctx || !this.canvas) return

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        // Draw gray background
        this.ctx.fillStyle = '#e0e0e0'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        // Draw board image
        if (this.boardImage) {
            this.ctx.drawImage(this.boardImage, 0, 0, this.canvas.width, this.canvas.height)
        }

        // Draw thermo image with opacity
        if (this.thermoImage) {
            this.ctx.globalAlpha = this.thermoImgOpacity
            this.ctx.drawImage(
                this.thermoImage,
                this.thermoRect.x,
                this.thermoRect.y,
                this.thermoRect.width,
                this.thermoRect.height,
            )
            this.ctx.globalAlpha = 1

            if (!this.locked) {
                // Draw resize border and handles...
                this.ctx.strokeStyle = '#00ff00'
                this.ctx.lineWidth = 1
                this.ctx.strokeRect(
                    this.thermoRect.x - this.padding,
                    this.thermoRect.y - this.padding,
                    this.thermoRect.width + 2 * this.padding,
                    this.thermoRect.height + 2 * this.padding,
                )
                this.drawResizeHandles()
            }
        }

        // Draw crosshair when locked and hovering
        if (this.locked && this.showCrosshair) {
            this.drawCrosshair()
        }
    }

    private drawCrosshair() {
        if (!this.ctx) return

        const size = 10 // Taille de la croix
        this.ctx.beginPath()
        this.ctx.strokeStyle = '#ffffff'
        this.ctx.lineWidth = 3
        // Ligne horizontale
        this.ctx.moveTo(this.crosshairPos.x - size, this.crosshairPos.y)
        this.ctx.lineTo(this.crosshairPos.x + size, this.crosshairPos.y)
        // Ligne verticale
        this.ctx.moveTo(this.crosshairPos.x, this.crosshairPos.y - size)
        this.ctx.lineTo(this.crosshairPos.x, this.crosshairPos.y + size)
        this.ctx.stroke()

        // Contour noir pour meilleure visibilité
        this.ctx.beginPath()
        this.ctx.strokeStyle = '#000000'
        this.ctx.lineWidth = 1
        this.ctx.moveTo(this.crosshairPos.x - size, this.crosshairPos.y)
        this.ctx.lineTo(this.crosshairPos.x + size, this.crosshairPos.y)
        this.ctx.moveTo(this.crosshairPos.x, this.crosshairPos.y - size)
        this.ctx.lineTo(this.crosshairPos.x, this.crosshairPos.y + size)
        this.ctx.stroke()
    }

    private drawResizeHandles() {
        if (!this.ctx) return

        const handles = this.getHandlePositions()
        this.ctx.fillStyle = '#ffffff'
        this.ctx.strokeStyle = '#00ff00'
        this.ctx.lineWidth = 1

        Object.values(handles).forEach((pos) => {
            this.ctx!.fillRect(pos.x - 5, pos.y - 5, 10, 10)
            this.ctx!.strokeRect(pos.x - 5, pos.y - 5, 10, 10)
        })
    }

    private getHandlePositions() {
        const { x, y, width, height } = this.thermoRect
        const p = this.padding
        return {
            nw: { x: x - p, y: y - p },
            n: { x: x + width / 2, y: y - p },
            ne: { x: x + width + p, y: y - p },
            e: { x: x + width + p, y: y + height / 2 },
            se: { x: x + width + p, y: y + height + p },
            s: { x: x + width / 2, y: y + height + p },
            sw: { x: x - p, y: y + height + p },
            w: { x: x - p, y: y + height / 2 },
        }
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
        if (this.locked) return

        const mousePos = this.getMousePosition(e)
        this.lastMousePos = mousePos

        // Check if clicking on resize handles
        const handles = this.getHandlePositions()
        for (const [handle, pos] of Object.entries(handles)) {
            if (Math.abs(pos.x - mousePos.x) < 10 && Math.abs(pos.y - mousePos.y) < 10) {
                this.isResizing = true
                this.selectedHandle = handle
                return
            }
        }

        // Check if clicking on image
        if (
            mousePos.x >= this.thermoRect.x &&
            mousePos.x <= this.thermoRect.x + this.thermoRect.width &&
            mousePos.y >= this.thermoRect.y &&
            mousePos.y <= this.thermoRect.y + this.thermoRect.height
        ) {
            this.isDragging = true
        }
    }

    private handleMouseMove = (e: MouseEvent) => {
        if (this.locked) return
        if (!this.isDragging && !this.isResizing) return

        const mousePos = this.getMousePosition(e)
        const dx = mousePos.x - this.lastMousePos.x
        const dy = mousePos.y - this.lastMousePos.y

        if (this.isDragging) {
            this.handleDrag(dx, dy)
        } else if (this.isResizing) {
            this.handleResize(dx, dy)
        }

        this.lastMousePos = mousePos
        this.draw()
    }

    private handleDrag(dx: number, dy: number) {
        let newX = this.thermoRect.x + dx
        let newY = this.thermoRect.y + dy

        // Constrain to canvas bounds
        newX = Math.max(
            -this.thermoRect.width / 2,
            Math.min(newX, this.canvas!.width - this.thermoRect.width / 2),
        )
        newY = Math.max(
            -this.thermoRect.height / 2,
            Math.min(newY, this.canvas!.height - this.thermoRect.height / 2),
        )

        this.thermoRect.x = newX
        this.thermoRect.y = newY
    }

    private handleResize(dx: number, dy: number) {
        const minSize = 20
        const handle = this.selectedHandle!

        if (handle.includes('n')) {
            const maxDy = this.thermoRect.height - minSize
            const actualDy = Math.max(-maxDy, dy)
            this.thermoRect.y += actualDy
            this.thermoRect.height -= actualDy
        }
        if (handle.includes('s')) {
            this.thermoRect.height = Math.max(minSize, this.thermoRect.height + dy)
        }
        if (handle.includes('w')) {
            const maxDx = this.thermoRect.width - minSize
            const actualDx = Math.max(-maxDx, dx)
            this.thermoRect.x += actualDx
            this.thermoRect.width -= actualDx
        }
        if (handle.includes('e')) {
            this.thermoRect.width = Math.max(minSize, this.thermoRect.width + dx)
        }
    }

    private handleMouseUp = () => {
        if (this.locked) return

        this.isDragging = false
        this.isResizing = false
        this.selectedHandle = null
    }

    private removeEventListeners() {
        if (!this.canvas) return

        this.canvas.removeEventListener('mousedown', this.handleMouseDown)
        document.removeEventListener('mousemove', this.handleMouseMove)
        document.removeEventListener('mouseup', this.handleMouseUp)

        this.canvas.removeEventListener('mousemove', this.handleCrosshairMove)
        this.canvas.removeEventListener('mouseenter', this.handleCanvasEnter)
        this.canvas.removeEventListener('mouseleave', this.handleCanvasLeave)
    }

    private addEventListeners() {
        if (!this.canvas) return

        this.canvas.addEventListener('mousedown', this.handleMouseDown)
        document.addEventListener('mousemove', this.handleMouseMove)
        document.addEventListener('mouseup', this.handleMouseUp)

        this.canvas.addEventListener('mousemove', this.handleCrosshairMove)
        this.canvas.addEventListener('mouseenter', this.handleCanvasEnter)
        this.canvas.addEventListener('mouseleave', this.handleCanvasLeave)
    }

    private handleCanvasEnter = () => {
        if (this.locked) {
            this.showCrosshair = true
            this.draw()
        }
    }

    private handleCanvasLeave = () => {
        this.showCrosshair = false
        this.draw()
    }

    private handleCrosshairMove = (e: MouseEvent) => {
        if (!this.locked || !this.thermoImage) return

        const mousePos = this.getMousePosition(e)
        this.crosshairPos = mousePos

        // Verify if the mouse is inside the thermo image
        if (this.isInsideThermoImage(mousePos)) {
            const color = this.getColorAtPoint(mousePos)
            if (color && this.handleColorPicker) {
                this.handleColorPicker(color)
            }
        }

        this.draw()
    }

    private isInsideThermoImage(point: Point): boolean {
        return (
            point.x >= this.thermoRect.x &&
            point.x <= this.thermoRect.x + this.thermoRect.width &&
            point.y >= this.thermoRect.y &&
            point.y <= this.thermoRect.y + this.thermoRect.height
        )
    }

    private getColorAtPoint(point: Point): { r: number; g: number; b: number } | null {
        if (!this.thermoImage || !this.ctx) return null

        // Create a temporary canvas to extract pixel data
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = this.thermoRect.width
        tempCanvas.height = this.thermoRect.height
        const tempCtx = tempCanvas.getContext('2d')
        if (!tempCtx) return null

        // Draw the thermo image on the temporary canvas without opacity
        tempCtx.drawImage(this.thermoImage, 0, 0, this.thermoRect.width, this.thermoRect.height)

        // Calculate the relative position of the point in the thermo image
        const relativeX = point.x - this.thermoRect.x
        const relativeY = point.y - this.thermoRect.y

        // Get the pixel data at the point
        const pixelData = tempCtx.getImageData(relativeX, relativeY, 1, 1).data

        return {
            r: pixelData[0],
            g: pixelData[1],
            b: pixelData[2],
        }
    }
}
