
import type { Command } from "./parser";
import { DrawCanvas } from "./canvas";

interface DrawState {
    x: number;
    y: number;
    angle: number;
    penDown: boolean;
    color: string;
    width: number;
}

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
                this.state.angle -= command.value;
                break;

            case "RIGHT":
                this.state.angle += command.value;
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