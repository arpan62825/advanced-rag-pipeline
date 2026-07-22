import { useState } from "react";
import { motion } from "motion/react";
import useChatStore from "../store/chatStore";

const InputBar = () => {
  const [input, setInput] = useState("");
  const sendMessage = useChatStore((s) => s.sendMessage);
  const isLoading = useChatStore((s) => s.isLoading);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    sendMessage(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="shrink-0 bg-cream-50 border-t border-cream-200 px-5 md:px-8 lg:px-12 pt-3 pb-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto flex items-end gap-3 bg-cream-100 rounded-2xl px-5 py-3 border border-cream-300 focus-within:border-cream-500 transition-colors duration-200 shadow-sm"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything"
          rows={1}
          disabled={isLoading}
          className="flex-1 bg-transparent outline-none resize-none text-sm text-ink placeholder:text-ink-muted leading-relaxed max-h-32 py-0.5 disabled:opacity-50"
          style={{
            height: "auto",
            minHeight: "24px",
            overflow: input.split("\n").length > 4 ? "auto" : "hidden",
          }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
          }}
        />

        <motion.button
          type="submit"
          disabled={!input.trim() || isLoading}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-ink text-cream-50 shrink-0 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-opacity duration-150"
          aria-label="Send message"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </motion.button>
      </form>

      <p className="text-center text-[11px] text-ink-muted mt-3 tracking-wide">
        AI can make mistakes. Please double-check responses.
      </p>
    </div>
  );
};

export default InputBar;
