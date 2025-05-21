interface RGB {
    r: number
    g: number
    b: number
}

export class CanvasColor {
    private canvas: HTMLCanvasElement | null = null
    private ctx: CanvasRenderingContext2D | null = null
    private image: HTMLImageElement | null = null
    private barHeight: number = 3
    private currentBar: { y: number; color: RGB } | null = null
    private colorTolerance: number = 30 // Tolerance for color matching

    constructor() {}

    public setCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
    }

    public setImage(imgElt: HTMLImageElement) {
        this.image = imgElt
        this.draw()
    }

    /**
     * Set a horizontal bar at the first position where the target color is found
     */
    public setBarByColor(targetColor: RGB) {
        if (!this.canvas || !this.ctx || !this.image) return

        try {
            // Get image data
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
            const data = imageData.data

            // Find first occurrence of the color
            const y = this.findFirstColorOccurrence(
                data,
                imageData.width,
                imageData.height,
                targetColor,
            )

            if (y !== null) {
                // Store current bar position and color
                this.currentBar = { y, color: targetColor }
                // Redraw canvas with the bar
                this.draw()
            }
        } catch (error) {
            console.error('Error in setBarByColor:', error)
        }
    }

    /**
     * Check if a color matches the target within tolerance
     */
    private isColorMatch(color1: RGB, color2: RGB): boolean {
        return (
            Math.abs(color1.r - color2.r) <= this.colorTolerance &&
            Math.abs(color1.g - color2.g) <= this.colorTolerance &&
            Math.abs(color1.b - color2.b) <= this.colorTolerance
        )
    }

    /**
     * Find first occurrence of the target color in the image
     * Returns y-position or null if not found
     */
    private findFirstColorOccurrence(
        data: Uint8ClampedArray,
        width: number,
        height: number,
        targetColor: RGB,
    ): number | null {
        // Start from top, check each pixel
        for (let y = this.barHeight; y < height - this.barHeight; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4
                const pixelColor = {
                    r: data[i],
                    g: data[i + 1],
                    b: data[i + 2],
                }

                if (this.isColorMatch(pixelColor, targetColor)) {
                    return y
                }
            }
        }

        return null
    }

    /**
     * Draw the canvas content including image and color matching bar
     */
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

        // Draw color matching bar if set
        if (this.currentBar) {
            const { y, color } = this.currentBar

            // Draw semi-transparent bar
            this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`
            this.ctx.fillRect(0, y - this.barHeight / 2, this.canvas.width, this.barHeight)

            // Draw border for better visibility
            this.ctx.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
            this.ctx.lineWidth = 1
            this.ctx.strokeRect(0, y - this.barHeight / 2, this.canvas.width, this.barHeight)
        }
    }
}
