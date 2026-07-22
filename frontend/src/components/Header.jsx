import useChatStore from "../store/chatStore";

const Header = () => {
  const toggleSidebar = useChatStore((s) => s.toggleSidebar);

  return (
    <header className="shrink-0 flex items-center justify-between px-6 md:px-8 py-4 bg-cream-50 border-b border-cream-200">
      {/* Menu / Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-cream-200 transition-colors duration-200 cursor-pointer"
        aria-label="Toggle sidebar"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ink-light"
        >
          <rect x="3" y="3" width="7" height="18" rx="2" />
          <rect x="14" y="3" width="7" height="18" rx="2" />
        </svg>
      </button>

      {/* Logo / Title */}
      <h1 className="text-sm font-medium text-ink-light tracking-wide">
        RAG Assistant
      </h1>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cream-400 to-cream-600 shadow-sm" />
    </header>
  );
};

export default Header;
