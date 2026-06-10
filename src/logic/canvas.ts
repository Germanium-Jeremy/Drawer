import type { Point } from "../types/types";

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

        /**
     * Draw a polygon defined by an array of points.
     * @param points   The vertices of the polygon.
     * @param color    Fill (and stroke) color to use. If omitted, the current fillStyle is kept.
     * @param width    Stroke width. If omitted, the current lineWidth is kept.
     * @param rotation Rotation angle in degrees to apply around the polygon's centroid.
     *                 If omitted or 0, the polygon is drawn as‑is.
     */
    drawPolygon(
        points: Point[],
        color?: string,
        width?: number,
        rotation?: number
    ) {
        if (points.length < 2) return;
        // Save the current context state so we can restore after drawing.
        this.ctx.save();
        // Apply optional styling.
        if (color !== undefined) this.ctx.fillStyle = color;
        if (width !== undefined) this.ctx.lineWidth = width;
        if (color !== undefined) this.ctx.strokeStyle = color;
        // Compute rotation if requested.
        let transformed = points;
        if (rotation && rotation !== 0) {
            const rad = (rotation * Math.PI) / 180;
            // Compute centroid.
            const centroid = points.reduce(
                (c, p) => ({ x: c.x + p.x / points.length, y: c.y + p.y / points.length }),
                { x: 0, y: 0 }
            );
            transformed = points.map(p => {
                const dx = p.x - centroid.x;
                const dy = p.y - centroid.y;
                const rx = dx * Math.cos(rad) - dy * Math.sin(rad) + centroid.x;
                const ry = dx * Math.sin(rad) + dy * Math.cos(rad) + centroid.y;
                return { x: rx, y: ry };
            });
        }

        this.ctx.beginPath();
        this.ctx.moveTo(transformed[0].x, transformed[0].y);
        for (let i = 1; i < transformed.length; i++) {
            this.ctx.lineTo(transformed[i].x, transformed[i].y);
        }
        this.ctx.closePath();
        // Fill then stroke to give both visual effects.
        this.ctx.fill();
        this.ctx.stroke();

        // Restore original context (styles, transforms, etc.).
        this.ctx.restore();
    }
}