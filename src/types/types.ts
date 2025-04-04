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
    ignoreInUI?: boolean;
    loading?: boolean;
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
    path: string
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
    status: "pending" | "completed" | "in-progress" | "failed";
    code?: string;
    path?: string;
    _executed?: boolean;
    error?: string;
}


export interface MessagesState {
    messages: Message[];
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    clearMessages: () => void;
}

export const refinePromptTypes = z.object({
    prompt: z.string().min(5)
})

export const setModelTypes = z.object({
    modelId: z.string(),
})