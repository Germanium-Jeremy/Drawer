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
}

export interface Point {
    x: number;
    y: number;
}