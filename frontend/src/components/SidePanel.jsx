import { AnimatePresence, motion } from "motion/react";
import useChatStore from "../store/chatStore";

const SidePanel = () => {
  const isSidebarOpen = useChatStore((s) => s.isSidebarOpen);
  const closeSidebar = useChatStore((s) => s.closeSidebar);
  const conversations = useChatStore((s) => s.conversations);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const createConversation = useChatStore((s) => s.createConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);

  const handleNewChat = () => {
    createConversation();
    closeSidebar();
  };

  const handleSelectConversation = (id) => {
    setActiveConversation(id);
    closeSidebar();
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/25 backdrop-blur-[3px] z-40"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-80 bg-cream-50 border-r border-cream-300 z-50 flex flex-col shadow-2xl"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-cream-200">
              <h2 className="text-base font-semibold text-ink tracking-tight">
                Chats
              </h2>
              <button
                onClick={closeSidebar}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-cream-200 transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-ink-muted"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* New Chat button */}
            <div className="px-5 pt-5 pb-3">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-ink text-cream-50 text-sm font-medium hover:bg-ink-light transition-colors duration-200 cursor-pointer shadow-sm"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Chat
              </button>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-12 px-4">
                  <div className="w-12 h-12 rounded-full bg-cream-200 flex items-center justify-center mb-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-ink-muted"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-ink-muted text-center leading-relaxed">
                    No conversations yet.
                    <br />
                    <span className="text-xs text-cream-500">Start a new chat to get going!</span>
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {conversations.map((conv) => (
                    <motion.li
                      key={conv.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectConversation(conv.id)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          handleSelectConversation(conv.id)
                        }
                        className={`group flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm cursor-pointer transition-colors duration-150 ${
                          activeConversationId === conv.id
                            ? "bg-cream-200 text-ink font-medium border border-cream-300"
                            : "text-ink-light hover:bg-cream-100"
                        }`}
                      >
                        <span className="truncate flex-1">{conv.title}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-cream-300 transition-all duration-150 cursor-pointer"
                          aria-label="Delete conversation"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="text-ink-muted"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-cream-200">
              <p className="text-xs text-ink-muted text-center tracking-wide">
                Advanced RAG Pipeline
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default SidePanel;
