"use client"

import { useState } from "react"
import {
  ChevronRight,
  File,
  FileCode2,
  FileJson2,
  FileText,
  FolderClosed,
  FolderOpen,
  FileImage,
  FileCog,
  FileArchive,
  FileAudio,
  FileVideo,
  FileSpreadsheet,
  FilePieChart,
  FileBarChart2,
  FileType2,
  MoreVertical,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { FileType } from "@/types/types"
import { cn } from "@/lib/utils"

interface FileExplorerProps {
  files: FileType[]
  onFileSelect: (file: FileType) => void
  onToggleDirectory: (fileId: string) => void
  selectedFileId: string | undefined
}

export function FileExplorer({ files, onFileSelect, onToggleDirectory, selectedFileId }: FileExplorerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const renderFileIcon = (file: FileType) => {
    if (file.type === "directory") {
      return file.isOpen ? (
        <FolderOpen className="h-4 w-4 text-yellow-400" />
      ) : (
        <FolderClosed className="h-4 w-4 text-yellow-400" />
      )
    }

    const extension = file.name.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "tsx":
      case "ts":
      case "jsx":
      case "js":
        return <FileCode2 className="h-4 w-4 text-blue-400" />
      case "json":
        return <FileJson2 className="h-4 w-4 text-yellow-300" />
      case "md":
        return <FileText className="h-4 w-4 text-gray-400" />
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "svg":
      case "webp":
        return <FileImage className="h-4 w-4 text-purple-400" />
      case "config":
      case "conf":
      case "env":
        return <FileCog className="h-4 w-4 text-gray-400" />
      case "zip":
      case "rar":
      case "tar":
      case "gz":
        return <FileArchive className="h-4 w-4 text-orange-400" />
      case "mp3":
      case "wav":
      case "ogg":
        return <FileAudio className="h-4 w-4 text-green-400" />
      case "mp4":
      case "webm":
      case "mov":
        return <FileVideo className="h-4 w-4 text-red-400" />
      case "csv":
      case "xls":
      case "xlsx":
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />
      case "html":
      case "css":
        return <FileType2 className="h-4 w-4 text-orange-500" />
      case "pdf":
        return <FilePieChart className="h-4 w-4 text-red-500" />
      case "py":
      case "rb":
      case "php":
        return <FileBarChart2 className="h-4 w-4 text-blue-600" />
      default:
        return <File className="h-4 w-4 text-gray-400" />
    }
  }

  const renderFileTree = (files: FileType[], level = 0) => {
    return files.map((file) => (
      <div key={file.id} className="relative">
        <motion.div
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          className={cn(
            "flex items-center py-1.5 px-2 cursor-pointer rounded-sm transition-all duration-100 relative group",
            selectedFileId === file.id ? "bg-[#37373d]" : "hover:bg-[#2a2d2e]",
            level === 0 ? "mt-0.5" : "",
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => {
            if (file.type === "directory") {
              onToggleDirectory(file.id)
            } else {
              onFileSelect(file)
            }
          }}
          onMouseEnter={() => setHoveredId(file.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          {file.type === "directory" && (
            <motion.span
              className="mr-1 flex items-center justify-center"
              initial={{ rotate: file.isOpen ? 90 : 0 }}
              animate={{ rotate: file.isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </motion.span>
          )}
          <span className="mr-2 flex items-center">{renderFileIcon(file)}</span>
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              file.type === "directory" ? "text-gray-200" : "text-gray-300",
            )}
          >
            {file.name}
          </span>

          {hoveredId === file.id && (
            <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4 text-gray-400 hover:text-gray-200" />
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {file.type === "directory" && file.isOpen && file.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {renderFileTree(file.children, level + 1)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ))
  }

  return (
    <div className="h-full bg-[#1e1e1e] overflow-y-auto border-r border-[#333333] flex flex-col">
      <div className="p-3 text-sm font-semibold text-gray-300 border-b border-[#333333] bg-[#252526] sticky top-0 z-10 flex items-center justify-between">
        <span>EXPLORER</span>
      </div>
      <div className="flex-1 py-1">{renderFileTree(files)}</div>
    </div>
  )
}

