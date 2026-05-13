"use client";
import { useEffect } from "react";
import { useChatContext, ToastNotification } from "@/context/ChatContext";

function Toast({
  n,
  onDismiss,
  onOpen,
}: {
  n: ToastNotification;
  onDismiss: (id: string) => void;
  onOpen: (taskId: string) => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(n.id), 4000);
    return () => clearTimeout(t);
  }, [n.id, onDismiss]);

  return (
    <div
      onClick={() => { onOpen(n.taskId); onDismiss(n.id); }}
      className="bg-[#1a1a1a] border border-orange-500/30 rounded-xl px-4 py-3 shadow-xl shadow-black/50 cursor-pointer hover:bg-[#222222] transition-colors duration-150 flex items-start gap-3 w-80"
    >
      <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1.5" />
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-semibold mb-0.5 truncate">
          {n.senderName} · <span className="text-gray-400 font-normal">{n.taskNaslov}</span>
        </p>
        <p className="text-gray-400 text-xs truncate">
          {n.message.length > 50 ? `${n.message.slice(0, 50)}…` : n.message}
        </p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(n.id); }}
        className="text-gray-600 hover:text-gray-300 transition-colors shrink-0 mt-0.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ChatNotification() {
  const { notifications, dismissNotification, requestOpenTask } = useChatContext();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2">
      {notifications.map((n) => (
        <Toast key={n.id} n={n} onDismiss={dismissNotification} onOpen={requestOpenTask} />
      ))}
    </div>
  );
}
