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