"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type ToastNotification = {
  id: string;
  taskId: string;
  taskNaslov: string;
  senderName: string;
  message: string;
};

type ChatContextType = {
  notifications: ToastNotification[];
  pushNotification: (n: Omit<ToastNotification, "id">) => void;
  dismissNotification: (id: string) => void;
  openRequest: string | null;
  requestOpenTask: (taskId: string) => void;
  clearOpenRequest: () => void;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatContextProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [openRequest, setOpenRequest] = useState<string | null>(null);

  const pushNotification = useCallback((n: Omit<ToastNotification, "id">) => {
    const id = crypto.randomUUID();
    setNotifications((prev) => [...prev, { ...n, id }]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const requestOpenTask = useCallback((taskId: string) => {
    setOpenRequest(taskId);
  }, []);

  const clearOpenRequest = useCallback(() => {
    setOpenRequest(null);
  }, []);

  return (
    <ChatContext.Provider value={{ notifications, pushNotification, dismissNotification, openRequest, requestOpenTask, clearOpenRequest }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used inside ChatContextProvider");
  return ctx;
}
