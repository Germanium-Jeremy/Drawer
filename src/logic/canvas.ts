interface Point {
    x: number;
    y: number;
}

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
        this.ctx.shadowBlur = 15;
        // this.ctx.shadowColor = color;

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

    drawArc(
        x: number,
        y: number,
        radius: number,
        start: number,
        end: number,
        color: string,
        width: number
    ) {
        this.ctx.beginPath();

        this.ctx.arc(
            x,
            y,
            radius,
            start * Math.PI / 180,
            end * Math.PI / 180
        );

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;

        this.ctx.stroke();
    }

    drawEllipse(
        x: number,
        y: number,
        rx: number,
        ry: number,
        color: string,
        width: number
    ) {
        this.ctx.beginPath();

        this.ctx.ellipse(
            x,
            y,
            rx,
            ry,
            0,
            0,
            Math.PI * 2
        );

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;

        this.ctx.stroke();
    }

    drawPolygon(points: Point[]) {
        this.ctx.beginPath();

        this.ctx.moveTo(
            points[0].x,
            points[0].y
        );

        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(
                points[i].x,
                points[i].y
            );
        }

        this.ctx.closePath();
        this.ctx.fill();
    }
}