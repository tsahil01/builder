"use client"

import { EditorInterface } from "@/components/editor-interface"
import { useStepsStore } from "@/store/initialStepsAtom";
import { useMessagesStore } from "@/store/messagesAtom";
import { useRouter, useParams } from "next/navigation";
import { Switch } from "@/components/ui/switch"
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { BlocksIcon, Download, Loader2 } from "lucide-react";
import { SendPrompt } from "@/components/SendPrompt";
import { Content, Message, } from "@/types/types";
import { StepList } from "@/components/StepList";
import { MessageComponent } from "@/components/Messages";
import { useFileStore } from "@/store/filesAtom";
import { User } from "@/components/User";
import { Web2 } from "@/components/Web2";
import { extractAndParseStepsFromMessages } from "@/lib/extract-parse-steps";
import { handleDownload } from "@/lib/download-project";
import Sidebar from "@/components/Sidebar";
import { startNewContainer } from "@/lib/worker-config";
import { ArtifactParser } from "@/lib/artifactParser";

export default function Editor() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState<boolean>(true);
    const { messages, addMessage, setMessages } = useMessagesStore();
    const { steps, setSteps, addSteps } = useStepsStore();
    const { files } = useFileStore();
    const [prompt, setPrompt] = useState("");
    const [framework, setFramework] = useState<string>("");

    const [containerId, setContainerId] = useState<string>("");

    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [uiMsgs, setUiMsgs] = useState<Message[]>([]);
    const [building, setBuilding] = useState(false);
    const conversationRef = useRef<HTMLDivElement>(null);
    const [validationError, setValidationError] = useState<string>("");
    const [project, setProject] = useState<any | null>(null);
    const [currentActionBuilding, setCurrentActionBuilding] = useState<string | null>(null);

    const params = useParams()
    const projectId = params.projectId as string

    useEffect(() => {
        if (!projectId) {
            router.push("/");
            return;
        }
        const validateAndLoadProject = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setValidationError("Authentication required");
                    router.push("/");
                    return;
                }

                const response = await fetch(`/api/main/project/${projectId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const data = await response.json();
                    setValidationError(data.message || 'Invalid project ID or access denied');
                    router.push("/");
                    return;
                }

                const projectData = await response.json();
                console.log("Project", projectData)
                setProject(projectData);
                setFramework(projectData.framework);

                if (projectData.messages.length === 0) {
                    await saveMsg(messages.slice(0, messages.length - 1));
                    const lastUserMessage = messages.filter(msg => msg.role === "user").pop();
                    if (lastUserMessage) {
                        console.log("Sending last user message: ", lastUserMessage);
                        send(lastUserMessage.content, projectData.framework);
                    }
                }

                if (projectData.messages && projectData.messages.length > 0) {
                    setMessages(projectData.messages);

                    const extractedSteps = extractAndParseStepsFromMessages(projectData.messages);
                    console.log("Extracted steps", extractedSteps);
                    setSteps(extractedSteps);

                    const displayMessages = projectData.messages
                        .filter((msg: Message) => !msg.ignoreInUI)
                        .map((msg: Message) => {
                            if (msg.role === "assistant" && msg.content.length > 0) {
                                return {
                                    ...msg,
                                    content: msg.content.map((content: Content) => ({
                                        ...content,
                                        text: (content.text
                                            ? `\n\n**Content before response:**\n${content.text}`
                                                .replace(
                                                    /<boltArtifact[\s\S]*?<\/boltArtifact>([\s\S]*)/,
                                                    (match, after) =>
                                                        after.trim()
                                                            ? `\n\n**Content after response:**\n${after.trim()}`
                                                            : ""
                                                )
                                            : "")

                                    }))
                                };
                            }
                            return msg;
                        }) || [];

                    setUiMsgs(displayMessages);
                }

                setInitialLoadComplete(true);
            } catch (error) {
                console.error("Error validating project:", error);
                setValidationError('Error loading project data');
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        validateAndLoadProject();
    }, []);

    useEffect(() => {
        if (project == null) {
            console.log("Project is null");
            return;
        }

        const startContainer = async () => {
            try {
                const image = project?.framework === "REACT" ? "buildx-react" : "null";
                console.log("Starting container with image:", image);

                const data = await startNewContainer(image, "tail -f /dev/null");
                console.log("Container started", data);

                setContainerId(data.containerId);

            } catch (error) {
                console.error("Error starting container:", error);
            };
        }
        startContainer();
    }, [project])


    // useEffect(() => {
    //     let originalFiles = [...files];
    //     let updateHappened = false;

    //     steps.filter(({ status }) => status === "pending").map(step => {
    //         updateHappened = true;

    //         if (step?.type === StepType.CreateFile) {
    //             let parsedPath = step.path?.split("/") ?? [];
    //             let currentFileStructure = [...originalFiles];
    //             const finalAnswerRef = currentFileStructure;

    //             let currentFolder = ""
    //             while (parsedPath.length) {
    //                 currentFolder = `${currentFolder}/${parsedPath[0]}`;
    //                 const currentFolderName = parsedPath[0];
    //                 parsedPath = parsedPath.slice(1);


    //                 if (!parsedPath.length) {
    //                     const file = currentFileStructure.find(x => x.id === currentFolder);

    //                     if (!file) {
    //                         currentFileStructure.push({
    //                             id: currentFolder,
    //                             name: currentFolderName,
    //                             type: 'file',
    //                             path: currentFolder,
    //                             content: step.code
    //                         })
    //                     } else {
    //                         file.content = step.code;
    //                     }
    //                 } else {
    //                     const folder = currentFileStructure.find(x => x.path === currentFolder)
    //                     if (!folder) {
    //                         currentFileStructure.push({
    //                             id: currentFolder,
    //                             name: currentFolderName,
    //                             type: 'directory',
    //                             path: currentFolder,
    //                             children: []
    //                         })
    //                     }
    //                     currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
    //                 }
    //             }
    //             originalFiles = finalAnswerRef;
    //         }

    //     })
    //     if (updateHappened) {
    //         setFiles(originalFiles)
    //         const updatedSteps: Step[] = steps.map(step => {
    //             if (step.status === "pending") {
    //                 if (step.type === StepType.RunScript) {
    //                     return { ...step, status: "in-progress" }
    //                 }
    //                 return { ...step, status: "completed" }
    //             }
    //             return step;
    //         })
    //         setSteps(updatedSteps);
    //     }
    // }, [steps, files, setFiles, setSteps]);

    // useEffect(() => {
    //     if (!webcontainer) return;
    //     const createFileSystemTree = (files: FileType[]): FileSystemTree => {
    //         const result: FileSystemTree = {};
    //         for (const file of files) {
    //             if (file.type === "file") {
    //                 result[file.name] = {
    //                     file: {
    //                         contents: file.content || ''
    //                     }
    //                 };
    //             } else if (file.type === "directory") {
    //                 result[file.name] = {
    //                     directory: file.children ? createFileSystemTree(file.children) : {}
    //                 };
    //             }
    //         }
    //         return result;
    //     };
    //     const mountFiles = createFileSystemTree(files);
    //     // console.log(mountFiles);
    //     webcontainer.mount(mountFiles);

    // }, [files, webcontainer]);


    useEffect(() => {
        if (conversationRef.current) {
            conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
        }
    }, [uiMsgs]);

    async function saveMsg(msg: Message[]) {
        try {
            await fetch(`/api/main/save-project`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    projectId,
                    messages: msg,
                })
            });
        } catch (error) {
            console.error("Error saving project state:", error);
        }
    }

    async function send(content: Content[], projectFramework: string) {
        try {
            setIsStreaming(true);
            setUiMsgs(prev => [...prev, { role: "user", content: content }]);
            setUiMsgs(prev => [...prev, { role: "assistant", content: [], loading: true }]);

            await saveMsg([{
                role: "user",
                content: content,
                ignoreInUI: false
            }]);

            console.log("Framework: ", project?.framework);

            const response = await fetch('/api/main/chat', {
                method: 'POST',
                body: JSON.stringify({
                    messages,
                    prompt,
                    framework: projectFramework,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (!response.body) {
                throw new Error("Response body is null");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponseText = "";

            const artifactParser = new ArtifactParser();

            while (true) {
                const { done, value } = await reader.read();
                setBuilding(true);
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                artifactParser.addChunk(chunk);
                const newStep = artifactParser.getStep();
                const currentAction = artifactParser.getCurrentActionTitle();
                if (currentAction) {
                    console.log("Current action: ", currentAction);
                    setCurrentActionBuilding(currentAction);
                }
                if (newStep) {
                    console.log("New step: ", newStep);
                    addSteps([newStep]);
                }
                fullResponseText += chunk;

                // add the content before the XML to the visible response text
                const contentBeforeArtifact = artifactParser.getContentBeforeArtifact();
                if (contentBeforeArtifact) {
                    await setUiMsgs(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1] = {
                            ...newMsgs[newMsgs.length - 1],
                            role: "assistant",
                            content: [{
                                type: "text",
                                text: contentBeforeArtifact
                            }],
                            loading: false
                        };
                        return newMsgs;
                    });
                }

                if (contentBeforeArtifact.trim() == "") {
                    setUiMsgs(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1] = {
                            ...newMsgs[newMsgs.length - 1],
                            role: "assistant",
                            content: [{
                                type: "text",
                                text: "Okay, Building it..."
                            }],
                            loading: false
                        };
                        return newMsgs;
                    });
                }
                const contentAfterArtifact = artifactParser.getContentAfterArtifact();
                if (contentAfterArtifact) {
                    await setUiMsgs(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1] = {
                            role: "assistant",
                            content: [{
                                type: "text",
                                text: contentAfterArtifact
                            }],
                            loading: false
                        };
                        return newMsgs;
                    });
                }

            }

            while (artifactParser.getActions().length > 0) {
                const step = artifactParser.getStep();
                if (step) {
                    addSteps([step]);
                }
            }
            const currentAction = artifactParser.getCurrentActionTitle();
            console.log("Current action222: ", currentAction);
            setCurrentActionBuilding(currentAction);

            const newMsg: Message = {
                role: "assistant",
                content: [{
                    type: "text",
                    text: fullResponseText
                }],
                ignoreInUI: false
            };
            addMessage(newMsg);
            setIsStreaming(false);

            setUiMsgs(prev => {
                const newMsgs = [...prev];
                if (newMsgs.length > 0) {
                    newMsgs[newMsgs.length - 1].loading = false;
                }
                return newMsgs;
            });
            setBuilding(false);
            setCurrentActionBuilding(null);
            await saveMsg([newMsg]);

        } catch (e) {
            setUiMsgs(prev => {
                const newMsgs = [...prev];
                if (newMsgs.length > 0) {
                    newMsgs[newMsgs.length - 1].loading = false;
                }
                return newMsgs;
            });
            console.error("Error sending message: ", e);
            setIsStreaming(false);
        }
    }

    async function handleSubmit() {
        if (prompt.trim() === "" || isStreaming || building || !initialLoadComplete) return

        const userMsg: Message = {
            role: "user",
            content: [{
                type: "text",
                text: prompt
            }]
        };

        addMessage(userMsg);
        send(userMsg.content, framework);
        setPrompt("");
    }

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-[#1E1E1E]">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (validationError) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-[#1E1E1E] text-white">
                <h2 className="text-xl font-medium mb-4">Project Error</h2>
                <p className="text-red-400">{validationError}</p>
                <Button
                    className="mt-6"
                    onClick={() => router.push("/")}
                >
                    Return to Projects
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-row h-screen">
            <Sidebar />
            <main className="h-screen flex flex-col md:grid md:grid-cols-4 gap-3 p-3 bg-[#121212] overflow-hidden w-full">
                <div className="h-[40vh] md:h-auto md:col-span-1 flex flex-col rounded-xl overflow-hidden bg-[#1e1e1e] border border-gray-800 shadow-lg">
                    <div className="p-4 border-b border-gray-800">
                        <h2 className="text-lg font-medium text-gray-200">Conversation</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 scrollbar-hide gap-3" ref={conversationRef}>
                        {uiMsgs.map((msg: Message, idx: number) => (
                            <MessageComponent key={idx} message={(msg)} loading={isStreaming} />
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-800 bg-[#1e1e1e]">
                        <StepList StepTitle={currentActionBuilding} steps={steps} building={building} setPrompt={setPrompt} />
                        <SendPrompt handleSubmit={handleSubmit} prompt={prompt} setPrompt={setPrompt} disabled={isStreaming} />
                    </div>
                </div>

                <div className="flex-1 md:col-span-3 flex flex-col bg-[#1e1e1e] text-white rounded-xl overflow-hidden border border-gray-800 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 p-4 gap-4">
                        <div className="flex items-center gap-3 sm:gap-6">
                            <span

                                className="flex items-center gap-2 text-slate-200 cursor-pointer"
                                onClick={() => window.location.href = '/'}
                            >
                                <BlocksIcon size={32} />
                            </span>
                            <h2 className="text-lg font-medium text-gray-200">
                                {showPreview ? "Preview" : "Code"}
                            </h2>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${!showPreview ? "text-gray-300" : "text-gray-500"}`}>Code</span>
                                <Switch
                                    checked={showPreview}
                                    onCheckedChange={setShowPreview}
                                    className="data-[state=checked]:bg-gray-700 data-[state=unchecked]:bg-gray-800"
                                />
                                <span className={`text-sm ${showPreview ? "text-gray-300" : "text-gray-500"}`}>Preview</span>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-700 hover:bg-gray-800"
                                onClick={() => {
                                    handleDownload(files, projectId);
                                }}
                            >
                                <Download size={16} />
                            </Button>
                            <User />
                        </div>
                    </div>

                    <div className={`flex-1 overflow-hidden ${showPreview ? "hidden" : "block"}`}>
                        <EditorInterface containerId={containerId} />
                    </div>

                    <div className={`flex-1 overflow-hidden ${showPreview ? "block" : "hidden"}`}>
                        {/* <Web2 webcontainer={null} url={url} setUrl={setUrl} />  */}
                    </div>
                </div>
            </main>
        </div>
    );
}