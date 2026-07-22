import { useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import useChatStore from "../store/chatStore";
import MessageBubble from "./MessageBubble";

const EMPTY = [];

const ChatArea = () => {
  const conversations = useChatStore((s) => s.conversations);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const messages = useMemo(() => {
    const conv = conversations.find((c) => c.id === activeConversationId);
    return conv?.messages || EMPTY;
  }, [conversations, activeConversationId]);
  const isLoading = useChatStore((s) => s.isLoading);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new messages or content updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-5 md:px-10 lg:px-16 py-4"
    >
      {messages.length === 0 ? (
        /* Empty state */
        <div className="flex items-center justify-center h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 150 }}
            className="text-center px-6"
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-ink tracking-tight">
              What can I help with?
            </h2>
            <p className="mt-3 text-sm text-ink-muted max-w-xs mx-auto leading-relaxed">
              Ask me anything about the video content. I'll find the relevant
              timestamps for you.
            </p>
          </motion.div>
        </div>
      ) : (
        /* Messages */
        <div className="max-w-2xl mx-auto py-4 flex flex-col gap-5">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          <AnimatePresence>
            {isLoading &&
              !messages.some(
                (m) => m.role === "assistant" && m.isStreaming
              ) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl rounded-bl-md bg-cream-100 border border-cream-200">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          delay: i * 0.15,
                          ease: "easeInOut",
                        }}
                        className="w-2 h-2 rounded-full bg-cream-400"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
