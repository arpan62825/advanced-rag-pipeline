import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        damping: 22,
        stiffness: 260,
        mass: 0.8,
      }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.3 }}
        className={`px-5 py-3.5 text-[14.5px] leading-relaxed shadow-sm ${
          isUser
            ? "max-w-[85%] md:max-w-[72%] lg:max-w-[65%] bg-cream-200 text-ink rounded-2xl rounded-br-md border border-cream-300"
            : "w-full bg-cream-100 text-ink-light rounded-2xl rounded-bl-md border border-cream-200"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown>{message.content}</ReactMarkdown>
            {message.isStreaming && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
                className="inline-block w-1.5 h-4 bg-ink-muted rounded-sm ml-0.5 align-text-bottom"
              />
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MessageBubble;
