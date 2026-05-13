"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useChatContext } from "@/context/ChatContext";

type ChatTask = {
  id: string;
  naslov: string;
  status: string;
  narocnikId: string;
  izvajalecId: string | null;
  narocnik: { ime: string };
  izvajalec: { ime: string } | null;
  messageCount: number;
  latestMessage: string | null;
  latestMessageAvtorId: string | null;
  latestMessageAvtorIme: string | null;
};

type Sporocilo = {
  id: string;
  besedilo: string;
  createdAt: string;
  avtorId: string;
  avtorIme: string;
};

function formatCas(iso: string) {
  return new Date(iso).toLocaleTimeString("sl-SI", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatWidget() {
  const { data: session, status } = useSession();
  const { pushNotification, openRequest, clearOpenRequest } = useChatContext();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "chat">("list");
  const [tasks, setTasks] = useState<ChatTask[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [sporocila, setSporocila] = useState<Sporocilo[]>([]);
  const [novo, setNovo] = useState("");
  const [posiljam, setPosiljam] = useState(false);
  const [seenCounts, setSeenCounts] = useState<Record<string, number>>({});

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Refs to read latest state inside polling callbacks without stale closures
  const openRef = useRef(open);
  const viewRef = useRef(view);
  const activeTaskIdRef = useRef(activeTaskId);
  const prevCountsRef = useRef<Record<string, number>>({});
  const initializedRef = useRef(false);

  useEffect(() => { openRef.current = open; }, [open]);
  useEffect(() => { viewRef.current = view; }, [view]);
  useEffect(() => { activeTaskIdRef.current = activeTaskId; }, [activeTaskId]);

  const userId = (session?.user as any)?.id as string | undefined;

  const openTask = useCallback((task: ChatTask) => {
    setActiveTaskId(task.id);
    setView("chat");
    setSporocila([]);
    setSeenCounts((prev) => ({ ...prev, [task.id]: task.messageCount }));
  }, []);

  const backToList = useCallback(() => {
    setView("list");
    setActiveTaskId(null);
    setSporocila([]);
    setNovo("");
  }, []);

  // Handle open requests from notifications
  useEffect(() => {
    if (!openRequest) return;
    const task = tasks.find((t) => t.id === openRequest);
    clearOpenRequest();
    if (task) {
      setOpen(true);
      openTask(task);
    }
  }, [openRequest, tasks, openTask, clearOpenRequest]);

  const fetchTasks = useCallback(() => {
    if (status !== "authenticated") return;
    fetch("/api/chat/naloge")
      .then((r) => r.json())
      .then((data: ChatTask[]) => {
        if (!Array.isArray(data)) return;

        if (!initializedRef.current) {
          // First load: mark everything as seen, no notifications
          const initial: Record<string, number> = {};
          data.forEach((t) => {
            initial[t.id] = t.messageCount;
            prevCountsRef.current[t.id] = t.messageCount;
          });
          setSeenCounts(initial);
          initializedRef.current = true;
        } else {
          // Subsequent polls: detect new messages from others
          data.forEach((t) => {
            const prev = prevCountsRef.current[t.id] ?? 0;
            if (
              t.messageCount > prev &&
              t.latestMessageAvtorId &&
              t.latestMessageAvtorId !== userId &&
              t.latestMessage
            ) {
              const notViewing =
                !openRef.current ||
                viewRef.current !== "chat" ||
                activeTaskIdRef.current !== t.id;
              if (notViewing) {
                pushNotification({
                  taskId: t.id,
                  taskNaslov: t.naslov,
                  senderName: t.latestMessageAvtorIme ?? "Neznani pošiljatelj",
                  message: t.latestMessage,
                });
              }
            }
            prevCountsRef.current[t.id] = t.messageCount;
          });
        }

        setTasks(data);
      });
  }, [status, userId, pushNotification]);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const fetchSporocila = useCallback(() => {
    if (!activeTaskId) return;
    fetch(`/api/chat/naloge/${activeTaskId}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSporocila(data); });
  }, [activeTaskId]);

  useEffect(() => {
    if (!activeTaskId || view !== "chat") return;
    fetchSporocila();
    const interval = setInterval(fetchSporocila, 3000);
    return () => clearInterval(interval);
  }, [activeTaskId, view, fetchSporocila]);

  useEffect(() => {
    if (view === "chat") setTimeout(() => inputRef.current?.focus(), 50);
  }, [view]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sporocila]);

  const posli = async () => {
    if (!novo.trim() || posiljam || !activeTaskId) return;
    setPosiljam(true);
    const res = await fetch(`/api/chat/naloge/${activeTaskId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ besedilo: novo.trim() }),
    });
    if (res.ok) {
      const s = await res.json();
      setSporocila((prev) => [...prev, s]);
      setNovo("");
      const newCount = (prevCountsRef.current[activeTaskId] ?? 0) + 1;
      prevCountsRef.current[activeTaskId] = newCount;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeTaskId
            ? { ...t, messageCount: t.messageCount + 1, latestMessage: s.besedilo, latestMessageAvtorId: userId ?? null }
            : t
        )
      );
      setSeenCounts((prev) => ({ ...prev, [activeTaskId]: (prev[activeTaskId] ?? 0) + 1 }));
    }
    setPosiljam(false);
  };

  if (status !== "authenticated" || tasks.length === 0) return null;

  const totalUnread = tasks.reduce(
    (sum, t) => sum + Math.max(0, t.messageCount - (seenCounts[t.id] ?? 0)),
    0
  );
  const activeTask = tasks.find((t) => t.id === activeTaskId);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-96 h-[500px] bg-[#111111] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
            {view === "chat" && activeTask ? (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    onClick={backToList}
                    className="text-gray-500 hover:text-gray-300 transition-colors shrink-0 text-base leading-none"
                  >
                    ←
                  </button>
                  <p className="text-white font-semibold text-sm truncate">{activeTask.naslov}</p>
                </div>
                <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-300 transition-colors shrink-0 ml-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <p className="text-white font-semibold text-sm">Sporočila</p>
                <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Task list */}
          {view === "list" && (
            <div className="flex-1 overflow-y-auto">
              {tasks.map((t) => {
                const unread = Math.max(0, t.messageCount - (seenCounts[t.id] ?? 0));
                return (
                  <button
                    key={t.id}
                    onClick={() => openTask(t)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-white text-sm font-medium truncate">{t.naslov}</p>
                        {unread > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shrink-0 font-medium">
                            {unread > 9 ? "9+" : unread}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs truncate">
                        {t.latestMessage ?? "Brez sporočil"}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}

          {/* Chat */}
          {view === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
                {sporocila.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center mt-10">Še ni sporočil. Začnite pogovor.</p>
                ) : (
                  sporocila.map((s) => {
                    const moje = s.avtorId === userId;
                    return (
                      <div key={s.id} className={`flex flex-col ${moje ? "items-end" : "items-start"}`}>
                        <span className="text-xs text-gray-600 mb-0.5 px-1">
                          {moje ? "Vi" : s.avtorIme} · {formatCas(s.createdAt)}
                        </span>
                        <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm break-words leading-relaxed ${
                          moje
                            ? "bg-orange-500 text-white rounded-tr-sm"
                            : "bg-[#1a1a1a] text-gray-200 border border-white/5 rounded-tl-sm"
                        }`}>
                          {s.besedilo}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <div className="px-3 py-2.5 border-t border-white/5 flex gap-2 shrink-0">
                <input
                  ref={inputRef}
                  className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-all"
                  placeholder="Napišite sporočilo..."
                  value={novo}
                  onChange={(e) => setNovo(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); posli(); } }}
                />
                <button
                  onClick={posli}
                  disabled={posiljam || !novo.trim()}
                  className="bg-orange-500 text-white px-3 py-2 rounded-xl hover:bg-orange-600 transition-all duration-150 disabled:opacity-40 shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-14 h-14 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 relative"
      >
        {open ? (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        {!open && totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-medium">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>
    </div>
  );
}
