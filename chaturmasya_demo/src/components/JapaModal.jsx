import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import JapaSeva from "../pages/JapaSeva";

export default function JapaModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);

    // Prevent the page behind the modal from scrolling.
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      window.scrollTo(0, scrollY);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="japa-modal-title"
      className="
        fixed inset-0 z-[999999]
        flex items-stretch justify-center
        bg-slate-950/70 backdrop-blur-sm
        sm:items-center sm:p-4 lg:p-6
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        className="
          flex h-[100dvh] min-h-0 w-full flex-col
          overflow-hidden bg-white shadow-2xl
          sm:h-[calc(100dvh-2rem)]
          sm:max-h-[920px] sm:max-w-5xl sm:rounded-2xl
          lg:h-[calc(100dvh-3rem)]
        "
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Fixed header */}
        <header
          className="
            relative z-20 flex shrink-0 items-center justify-between
            border-b border-slate-200 bg-white
            px-4 py-3 sm:px-6 sm:py-4
          "
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <button
            type="button"
            aria-label="Close japa offering"
            onClick={onClose}
            className="
              grid h-10 w-10 shrink-0 place-items-center rounded-full
              border border-slate-200 bg-slate-50 text-slate-600
              transition hover:bg-slate-100 hover:text-slate-950
              focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
            "
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* This is the only scrolling region */}
        <div
          className="
            min-h-0 flex-1 overflow-x-hidden overflow-y-auto
            overscroll-contain bg-slate-50
            [scrollbar-gutter:stable]
          "
          style={{
            WebkitOverflowScrolling: "touch",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <JapaSeva onClose={onClose} isModal />
        </div>
      </section>
    </div>,
    document.body
  );
}
