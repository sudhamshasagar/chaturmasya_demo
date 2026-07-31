import React from "react";
import JapaSeva from "../pages/JapaSeva"; // Adjust path as needed

export default function JapaModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 lg:p-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] lg:h-[80vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex justify-between items-center bg-[#FAFAFA] border-b border-slate-200 p-5 lg:px-8 shrink-0 z-10">
          <h2 className="text-xl font-semibold text-slate-800 tracking-wide">
            Divine Offering
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition-colors text-2xl pb-1 leading-none"
          >
            ×
          </button>
        </div>

        {/* Modal Body - Strictly flex to contain internal scrolling */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          <JapaSeva onClose={onClose} isModal={true} />
        </div>
      </div>
    </div>
  );
}