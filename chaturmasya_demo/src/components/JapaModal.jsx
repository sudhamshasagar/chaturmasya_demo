import React from "react";
import JapaSeva from "../pages/JapaSeva"; // Adjust path as needed

export default function JapaModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFBF0] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex justify-between items-center bg-white border-b border-orange-100 p-5 sm:px-8 shrink-0 z-10 shadow-sm">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-orange-800">
              🙏 Contribute Your Seva
            </h2>
            <p className="text-sm text-orange-600/80 mt-1">
              Offer your daily Japa and Shloka counts
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-colors text-2xl pb-1"
          >
            ×
          </button>
        </div>

        {/* Scrollable Body with Hidden Scrollbar */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <JapaSeva onClose={onClose} isModal={true} />
        </div>
      </div>
    </div>
  );
}