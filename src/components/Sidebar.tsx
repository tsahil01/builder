"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Menu,
    ChevronLeft,
    File,
    Loader2
} from "lucide-react";
import { getChatsTypes } from "@/types/types";

interface SidebarLinkProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    isCollapsed: boolean;
}

function SidebarLink({
    href,
    icon,
    label,
    isActive = false,
    isCollapsed,
}: SidebarLinkProps) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-800 ${isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"
                } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? label : undefined}
        >
            {icon}
            {!isCollapsed && <span className="truncate">{label}</span>}
        </Link>
    );
}

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isHovering, setIsHovering] = useState(false);
    const [chats, setChats] = useState<getChatsTypes[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function getChats() {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found");
                }
                
                const res = await fetch("/api/main/chats", {
                    headers: {
                        authorization: `Bearer ${token}`,
                    }
                });
                
                if (!res.ok) {
                    throw new Error(`Failed to fetch chats: ${res.status}`);
                }
                
                const chatsData = await res.json();
                setChats(chatsData);
                setError(null);
            } catch (err) {
                console.error("Error fetching chats:", err);
                setError(err instanceof Error ? err.message : "Failed to load chats");
            } finally {
                setLoading(false);
            }
        }
        
        getChats();
    }, []);

    const handleMouseEnter = () => {
        setIsHovering(true);
        setIsCollapsed(false);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        setIsCollapsed(true);
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const shouldExpand = !isCollapsed || isHovering;

    return (
        <>
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`flex h-screen flex-col text-white transition-all duration-300 pt-8 ${shouldExpand ? "w-64" : "w-16"
                    }`}
            >
                <div className="flex h-14 items-center justify-between px-4">
                    <button
                        onClick={toggleSidebar}
                        className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800"
                    >
                        {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {shouldExpand && (
                    <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                        <h2 className="text-sm font-semibold text-gray-400 mb-3">Chats</h2>
                        
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                <Loader2 size={24} className="animate-spin mb-2" />
                                <span className="text-sm">Loading chats...</span>
                            </div>
                        ) : error ? (
                            <div className="text-red-400 text-sm p-2">{error}</div>
                        ) : chats.length === 0 ? (
                            <div className="text-gray-400 text-sm p-2">No chats found.</div>
                        ) : (
                            chats.map((chat) => (
                                <SidebarLink
                                    key={chat.id}
                                    href={`/editor/${chat.id}`}
                                    icon={<File size={20} />}
                                    label={chat.name}
                                    isActive={false}
                                    isCollapsed={isCollapsed}
                                />
                            ))
                        )}
                    </nav>
                )}
            </div>

            <button
                className="fixed top-4 left-4 z-50 md:hidden bg-gray-900 text-white p-2 rounded-md"
                onClick={toggleSidebar}
            >
                <Menu size={20} />
            </button>
        </>
    );
}