export class DrawCanvas {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Could not get canvas context");
        }

        this.ctx = context;

        this.clear();
    }

    clear() {
        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }

    drawLine(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        color: string,
        width: number
    ) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;

        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);

        this.ctx.stroke();
    }

    // *** NEW: draw a full circle ***
    drawCircle(
      cx: number,
      cy: number,
      radius: number,
      color: string,
      width: number
    ) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = width;
      this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
}