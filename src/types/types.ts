import { z } from "zod";

export const userSignUp = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
})

export const userSignIn = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export const getTempleteTypes = z.object({
    prompt: z.string()
})

export const apiKeyTypes = z.object({
    apiKey: z.string()
})

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const chatBodyTypes = z.object({
    messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string()
    })),
    prompt: z.string(),
})

export interface FileType {
    id: string
    name: string
    type: "file" | "directory"
    language?: string
    content?: string
    isOpen?: boolean
    children?: FileType[]
}

export enum StepType {
    CreateFile,
    CreateFolder,
    EditFile,
    DeleteFile,
    DeleteFolder,
    RenameFile,
    RenameFolder,
    RunScript,
}

export interface Step {
    id: number;
    title: string;
    description: string;
    type: StepType
    status: "pending" | "completed" | "in-progress";
    code?: string;
    path?: string;
}


export interface MessagesState {
    messages: Message[];
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    clearMessages: () => void;
}

export interface StepsState {
    steps: Step[];
    setSteps: (steps: Step[]) => void;
    addStep: (step: Step) => void;
    clearSteps: () => void;
}