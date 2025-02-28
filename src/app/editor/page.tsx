"use client"
import { EditorInterface } from "@/components/editor-interface"
import { useStepsStore } from "@/store/initialStepsAtom";
import { useMessagesStore } from "@/store/messagesAtom";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Send } from "lucide-react";
import { SendPrompt } from "@/components/SendPrompt";
import { FileType, Message, Step, StepType } from "@/types/types";
import { StepList } from "@/components/StepList";
import { MessageComponent } from "@/components/Messages";


export default function Editor() {
    const router = useRouter();
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [files, setFiles] = useState<FileType[]>([]);
    const { messages, addMessage, clearMessages } = useMessagesStore();
    // const { steps, setSteps } = useStepsStore();
    const steps: Step[] = [
        {
            "id": 1,
            "title": "Project Files",
            "description": "",
            "type": 1,
            "status": "pending" as "pending"
        },
        {
            "id": 2,
            "title": "Create eslint.config.js",
            "description": "",
            "type": 0,
            "status": "pending",
            "code": "import js from '@eslint/js';\nimport globals from 'globals';\nimport reactHooks from 'eslint-plugin-react-hooks';\nimport reactRefresh from 'eslint-plugin-react-refresh';\nimport tseslint from 'typescript-eslint';\n\nexport default tseslint.config(\n  { ignores: ['dist'] },\n  {\n    extends: [js.configs.recommended, ...tseslint.configs.recommended],\n    files: ['**/*.{ts,tsx}'],\n    languageOptions: {\n      ecmaVersion: 2020,\n      globals: globals.browser,\n    },\n    plugins: {\n      'react-hooks': reactHooks,\n      'react-refresh': reactRefresh,\n    },\n    rules: {\n      ...reactHooks.configs.recommended.rules,\n      'react-refresh/only-export-components': [\n        'warn',\n        { allowConstantExport: true },\n      ],\n    },\n  }\n);",
            "path": "eslint.config.js"
        },
        {
            "id": 3,
            "title": "Create index.html",
            "description": "",
            "type": 0,
            "status": "pending",
            "code": "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/vite.svg\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Vite + React + TS</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.tsx\"></script>\n  </body>\n</html>",
            "path": "index.html"
        },
        {
            "id": 4,
            "title": "Create package.json",
            "description": "",
            "type": 0,
            "status": "pending",
            "code": "{\n  \"name\": \"vite-react-typescript-starter\",\n  \"private\": true,\n  \"version\": \"0.0.0\",\n  \"type\": \"module\",\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"vite build\",\n    \"lint\": \"eslint .\",\n    \"preview\": \"vite preview\"\n  },\n  \"dependencies\": {\n    \"lucide-react\": \"^0.344.0\",\n    \"react\": \"^18.3.1\",\n    \"react-dom\": \"^18.3.1\"\n  },\n  \"devDependencies\": {\n    \"@eslint/js\": \"^9.9.1\",\n    \"@types/react\": \"^18.3.5\",\n    \"@types/react-dom\": \"^18.3.0\",\n    \"@vitejs/plugin-react\": \"^4.3.1\",\n    \"autoprefixer\": \"^10.4.18\",\n    \"eslint\": \"^9.9.1\",\n    \"eslint-plugin-react-hooks\": \"^5.1.0-rc.0\",\n    \"eslint-plugin-react-refresh\": \"^0.4.11\",\n    \"globals\": \"^15.9.0\",\n    \"postcss\": \"^8.4.35\",\n    \"tailwindcss\": \"^3.4.1\",\n    \"typescript\": \"^5.5.3\",\n    \"typescript-eslint\": \"^8.3.0\",\n    \"vite\": \"^5.4.2\"\n  }\n}",
            "path": "package.json"
        },
        {
            "id": 5,
            "title": "Create postcss.config.js",
            "description": "",
            "type": 0,
            "status": "pending",
            "code": "export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};",
            "path": "postcss.config.js"
        },
        {
            "id": 6,
            "title": "Create tailwind.config.js",
            "description": "",
            "type": 0,
            "status": "pending",
            "code": "/** @type {import('tailwindcss').Config} */\nexport default {\n  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n};",
            "path": "tailwind.config.js"
        },
        {
            "id": 7,
            "title": "Create tsconfig.app.json",
            "description": "",
            "type": 0,
            "status": "pending",
            "code": "{\n  \"compilerOptions\": {\n    \"target\": \"ES2020\",\n    \"useDefineForClassFields\": true,\n    \"lib\": [\"ES2020\", \"DOM\", \"DOM.Iterable\"],\n    \"module\": \"ESNext\",\n    \"skipLibCheck\": true,\n\n    /* Bundler mode */\n    \"moduleResolution\": \"bundler\",\n    \"allowImportingTsExtensions\": true,\n    \"isolatedModules\": true,\n    \"moduleDetection\": \"force\",\n    \"noEmit\": true,\n    \"jsx\": \"react-jsx\",\n\n    /* Linting */\n    \"strict\": true,\n    \"noUnusedLocals\": true,\n    \"noUnusedParameters\": true,\n    \"noFallthroughCasesInSwitch\": true\n  },\n  \"include\": [\"src\"]\n}",
            "path": "tsconfig.app.json"
        },
        {
            "id": 8,
            "title": "Create tsconfig.json",
            "description": "",
            "type": 0,
            "status": "pending",
            "code": "{\n  \"files\": [],\n  \"references\": [\n    { \"path\": \"./tsconfig.app.json\" },\n    { \"path\": \"./tsconfig.node.json\" }\n  ]\n}",
            "path": "tsconfig.json"
        },
        {
            "id": 9,
            "title": "Create tsconfig.node.json",
            "description": "",
            "type": 0,
            "status": "pending",
            "code": "{\n  \"compilerOptions\": {\n    \"target\": \"ES2022\",\n    \"lib\": [\"ES2023\"],\n    \"module\": \"ESNext\",\n    \"skipLibCheck\": true,\n\n    /* Bundler mode */\n    \"moduleResolution\": \"bundler\",\n    \"allowImportingTsExtensions\": true,\n    \"isolatedModules\": true,\n    \"moduleDetection\": \"force\",\n    \"noEmit\": true,\n\n    /* Linting */\n    \"strict\": true,\n    \"noUnusedLocals\": true,\n    \"noUnusedParameters\": true,\n    \"noFallthroughCasesInSwitch\": true\n  },\n  \"include\": [\"vite.config.ts\"]\n}",
            "path": "tsconfig.node.json"
        },
        {
            "id": 10,
            "title": "Create vite.config.ts",
            "description": "",
            "type": 0,
            "status": "pending",
            "code": "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\n// https://vitejs.dev/config/\nexport default defineConfig({\n  plugins: [react()],\n  optimizeDeps: {\n    exclude: ['lucide-react'],\n  },\n});",
            "path": "vite.config.ts"
        },
        {
            "id": 11,
            "title": "Create src/App.tsx",
            "description": "",
            "type": 0,
            "status": "pending",
            "code": "import React from 'react';\n\nfunction App() {\n  return (\n    <div className=\"min-h-screen bg-gray-100 flex items-center justify-center\">\n      <p>Start prompting (or editing) to see magic happen :)</p>\n    </div>\n  );\n}\n\nexport default App;",
            "path": "src/App.tsx"
        },
        {
            "id": 12,
            "title": "Create src/index.css",
            "description": "",
            "type": 0,
            "status": "pending",
            "code": "@tailwind base;\n@tailwind components;\n@tailwind utilities;",
            "path": "src/index.css"
        },
        {
            "id": 13,
            "title": "Create src/main.tsx",
            "description": "",
            "type": 0,
            "status": "pending",
            "code": "import { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App.tsx';\nimport './index.css';\n\ncreateRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <App />\n  </StrictMode>\n);",
            "path": "src/main.tsx"
        },
        {
            "id": 14,
            "title": "Create src/vite-env.d.ts",
            "description": "",
            "type": 0,
            "status": "pending",
            "code": "/// <reference types=\"vite/client\" />",
            "path": "src/vite-env.d.ts"
        }
    ]

    console.log("Steps:", steps)

    // useEffect(() => {
    //     if (messages.length === 0) {
    //     router.push("/");
    // }}, [])

    return (
        <main className="min-h-screen min-w-screen grid grid-cols-3 p-3 overflow-hidden relative gap-3">
            <div className="col-span-1 h-full flex flex-col rounded-xl shadow-lg overflow-hidden p-4">
                <div className="flex-1 max-h-[calc(82vh-4rem)] overflow-y-auto gap-4 scrollbar-hide">
                    <MessageComponent key={0} message={messages[2]} />
                    <StepList steps={steps} currentStep={1} onStepClick={(stepId) => { }} />
                    {/* map msgs after messages[3] */}
                    {messages.slice(3).map((msg, idx) => (
                        <MessageComponent key={idx} message={msg} />
                    ))}
                </div>

                <div className="mt-auto">
                    <SendPrompt handleSubmit={() => { }} prompt={""} setPrompt={() => { }} />
                </div>
            </div>

            <div className="col-span-2 flex flex-col bg-[#1e1e1e] text-white h-full flex-1 rounded-xl shadow-lg overflow-hidden p-4">
                <div className="flex items-center justify-between border-b border-gray-700 pb-2 mb-2">
                    <h2 className="text-lg font-semibold">{
                        showPreview ? "Preview" : "Code"
                    }</h2>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">Code</span>
                            <Switch checked={showPreview} onCheckedChange={setShowPreview} />
                            <span className="text-sm text-gray-400">Preview</span>
                        </div>
                        <Button size={'sm'} variant={'outline'}>
                            <Download size={16} />
                        </Button>
                    </div>
                </div>

                <div className="flex-1">
                    <EditorInterface />
                </div>
            </div>
        </main>
    )
}
