
import type { Command } from "./parser";
import { DrawCanvas } from "./canvas";
import type { DrawState } from "../types/types";

export class DrawEngine {
    private canvas: DrawCanvas;

    private state: DrawState = {
        x: 400,
        y: 300,
        angle: 0,
        penDown: true,
        color: "#000000",
        width: 2,
        gradient: null
    };

    constructor(canvas: DrawCanvas) {
        this.canvas = canvas;
    }

    run(commands: Command[]) {
        for (const command of commands) {
            this.execute(command);
        }
    }

    private execute(command: Command) {
        switch (command.type) {
            case "FORWARD":
                this.move(command.value);
                break;

            case "BACKWARD":
                this.move(-command.value);
                break;

            case "LEFT":
                this.state.angle = (this.state.angle - command.value) % 360;
                // Normalise to 0‑360 range
                if (this.state.angle < 0) this.state.angle += 360;
                break;

            case "RIGHT":
                this.state.angle = (this.state.angle + command.value) % 360;
                if (this.state.angle < 0) this.state.angle += 360;
                break;

            case "PENUP":
                this.state.penDown = false;
                break;

            case "PENDOWN":
                this.state.penDown = true;
                break;

            case "COLOR":
                this.state.color = command.value;
                this.state.gradient = null;
                break;

            case "WIDTH":
                this.state.width = command.value;
                break;

            case "CLEAR":
                this.canvas.clear();
                break;

            case "REPEAT":
                for (let i = 0; i < command.count; i++) {
                    this.run(command.commands);
                }
                break;
            case "CIRCLE":
                // Draw a circle centered at the current turtle location.
                if (this.state.penDown) {
                    this.canvas.drawCircle(
                        this.state.x,
                        this.state.y,
                        command.radius,
                        this.resolveStrokeStyle(this.state.x, this.state.y, command.radius, command.radius),
                        this.state.width
                    );
                }
                break;
            case "ARC":
                // Draw an arc centred at the current turtle location.
                if (this.state.penDown) {
                    this.canvas.drawArc(
                        this.state.x,
                        this.state.y,
                        command.radius,
                        command.startAngle,
                        command.endAngle,
                        this.resolveStrokeStyle(this.state.x, this.state.y, command.radius, command.radius),
                        this.state.width
                    );
                }
                break;
            case "ELLIPSE":
                // Draw an ellipse centred at the current turtle location.
                if (this.state.penDown) {
                    this.canvas.drawEllipse(
                        this.state.x,
                        this.state.y,
                        command.rx,
                        command.ry,
                        this.resolveStrokeStyle(this.state.x, this.state.y, command.rx, command.ry),
                        this.state.width
                    );
                }
                break;
            case "ELLIPSEARC":
                if (!this.state.penDown || command.startAngle === command.endAngle) {
                    break;
                }
                if (!(command.rx > 0 && command.ry > 0)) {
                    throw new Error('ELLIPSEARC rx and ry must be > 0');
                }
                {
                    const strokeStyle = this.resolveStrokeStyle(
                        this.state.x,
                        this.state.y,
                        command.rx,
                        command.ry
                    );
                    this.canvas.drawEllipseArc(
                        this.state.x,
                        this.state.y,
                        command.rx,
                        command.ry,
                        command.startAngle,
                        command.endAngle,
                        strokeStyle,
                        this.state.width
                    );
                }
                break;
            case "POLYGON":
                // Draw a polygon using the provided points and optional styling.
                if (this.state.penDown) {
                    const polyColor = (command as any).color !== undefined ? (command as any).color : this.state.color;
                    const polyWidth = (command as any).width !== undefined ? (command as any).width : this.state.width;
                    const polyRotation = (command as any).rotation;
                    this.canvas.drawPolygon(
                        command.points,
                        polyColor,
                        polyWidth,
                        polyRotation
                    );
                }
                break;
            case "GRADIENT":
                this.state.gradient = { kind: command.gradientType, stops: command.stops };
                break;

            case "CLIPCIRCLE":
                if (command.radius <= 0) throw new Error('CLIPCIRCLE radius must be > 0');
                this.canvas.beginClipCircle(command.cx, command.cy, command.radius);
                break;

            case "CLIPELLIPSE":
                if (command.rx <= 0 || command.ry <= 0) throw new Error('CLIPELLIPSE rx and ry must be > 0');
                this.canvas.beginClipEllipse(command.cx, command.cy, command.rx, command.ry);
                break;

            case "ENDCLIP":
                this.canvas.endClip();
                break;

            case "SETXY":
                this.state.x = command.x;
                this.state.y = command.y;
                break;
            case "HOME":
                this.state.x = 400;
                this.state.y = 300;
                this.state.angle = 0;
                break;
        }
    }

    private resolveStrokeStyle(cx: number, cy: number, rx: number, ry: number): string | CanvasGradient {
        if (this.state.gradient !== null) {
            return this.canvas.buildGradient(this.state.gradient, cx, cy, rx, ry);
        }
        return this.state.color;
    }

    private move(distance: number) {
        const radians =
            (this.state.angle * Math.PI) / 180;

        const newX =
            this.state.x +
            distance * Math.cos(radians);

        const newY =
            this.state.y +
            distance * Math.sin(radians);

        if (this.state.penDown) {
            const strokeStyle = this.resolveStrokeStyle(
                (this.state.x + newX) / 2,
                (this.state.y + newY) / 2,
                Math.abs(newX - this.state.x) / 2,
                Math.abs(newY - this.state.y) / 2
            );
            this.canvas.drawLine(
                this.state.x,
                this.state.y,
                newX,
                newY,
                strokeStyle,
                this.state.width
            );
        }

        this.state.x = newX;
        this.state.y = newY;
    }
}