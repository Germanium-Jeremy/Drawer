export interface User {
    userId: number;
    username: string;
    email: string;
}

export interface File {
    fileId: number
    fileName: string
    content: string
    createdAt: Date
}

export interface DrawState {
    x: number;
    y: number;
    angle: number;
    penDown: boolean;
    color: string;
    width: number;
    gradient: GradientDef | null;
}

export interface Point {
    x: number;
    y: number;
}

export interface ColorStop {
    offset: number;  // 0.0 – 1.0
    color: string;   // CSS color string, e.g. "#ff0000" or "red"
}

export type GradientDef =
    | { kind: 'linear'; stops: ColorStop[] }
    | { kind: 'radial'; stops: ColorStop[] };