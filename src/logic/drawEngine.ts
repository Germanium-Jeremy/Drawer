
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
        width: 2
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
                        this.state.color,
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
                        this.state.color,
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
                        this.state.color,
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
            this.canvas.drawLine(
                this.state.x,
                this.state.y,
                newX,
                newY,
                this.state.color,
                this.state.width
            );
        }

        this.state.x = newX;
        this.state.y = newY;
    }
}