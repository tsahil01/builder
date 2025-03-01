"use client"

import { useState, useEffect } from "react"
import { FileExplorer } from "@/components/file-explorer"
import { CodeEditor } from "@/components/code-editor"
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileType } from "@/types/types"
import { useFileStore } from "@/store/filesAtom"
import { BlocksIcon } from "lucide-react"


export function EditorInterface() {
  const { files, setFiles } = useFileStore()
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null)
  const [openTabs, setOpenTabs] = useState<FileType[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)

  useEffect(() => {
    setOpenTabs(prevTabs => {
      return prevTabs.map(tab => {
        const findUpdatedFile = (fileArray: FileType[]): FileType | undefined => {
          for (const file of fileArray) {
            if (file.id === tab.id) {
              return file;
            }
            if (file.children) {
              const found = findUpdatedFile(file.children);
              if (found) return found;
            }
          }
          return undefined;
        };

        const updatedFile = findUpdatedFile(files);
        return updatedFile || tab;
      });
    });
  }, [files]);

  useEffect(() => {
    if (selectedFile) {
      const findUpdatedFile = (fileArray: FileType[]): FileType | undefined => {
        for (const file of fileArray) {
          if (file.id === selectedFile.id) {
            return file;
          }
          if (file.children) {
            const found = findUpdatedFile(file.children);
            if (found) return found;
          }
        }
        return undefined;
      };

      const updatedFile = findUpdatedFile(files);
      if (updatedFile) {
        setSelectedFile(updatedFile);
      }
    }
  }, [files, selectedFile]);

  const handleFileSelect = (file: FileType) => {
    if (file.type === "file") {
      setSelectedFile(file)

      if (!openTabs.find((tab) => tab.id === file.id)) {
        setOpenTabs([...openTabs, file])
      }

      setActiveTab(file.id)
    }
  }

  const handleTabClose = (fileId: string) => {
    const newTabs = openTabs.filter((tab) => tab.id !== fileId)
    setOpenTabs(newTabs)

    if (activeTab === fileId) {
      setActiveTab(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null)
      setSelectedFile(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null)
    }
  }

  const toggleDirectory = (fileId: string) => {
    const updateFiles = (files: FileType[]): FileType[] => {
      return files.map((file) => {
        if (file.id === fileId) {
          return { ...file, isOpen: !file.isOpen }
        }
        if (file.children) {
          return { ...file, children: updateFiles(file.children) }
        }
        return file
      })
    }

    setFiles(updateFiles(files))
  }

  return (
    <div className="h-full">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
          <FileExplorer
            files={files}
            onFileSelect={handleFileSelect}
            onToggleDirectory={toggleDirectory}
            selectedFileId={selectedFile?.id}
          />
        </ResizablePanel>

        <ResizablePanel defaultSize={80}>
          <div className="h-full flex flex-col">
            {openTabs.length > 0 ? (
              <>
                <Tabs value={activeTab || undefined} className="w-full">
                  <TabsList className="bg-[#252526] h-10 flex w-full justify-start rounded-none border-b border-[#3c3c3c]">
                    {openTabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="data-[state=active]:bg-[#1e1e1e] relative py-1.5 h-full hover:bg-[#1e1e1e] border border-[#3c3c3c] text-gray-300"
                        onClick={() => {
                          setActiveTab(tab.id)
                          setSelectedFile(tab)
                        }}
                      >
                        <span className="mr-2">{tab.name}</span>
                        <span
                          className="inline-flex items-center justify-center rounded-md my-auto w-5 h-5 text-xs hover:bg-gray-700 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTabClose(tab.id)
                          }}
                        >
                          ×
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {openTabs.map((tab) => (
                    <TabsContent key={tab.id} value={tab.id} className="h-full p-0 m-0 border-none">
                      <CodeEditor file={tab} />
                    </TabsContent>
                  ))}
                </Tabs>
              </>
            ) : (
              <div className="flex items-center justify-center h-full bg-zinc-900 text-gray-300">
                <div className="text-center p-6">
                  <BlocksIcon size={64} className="mx-auto mb-4 text-gray-400" />
                  <h2 className="text-2xl font-light mb-2 text-gray-200">Welcome to the Editor</h2>
                  <p className="text-gray-400">Select a file from the explorer to start editing</p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}