"use client";

import { useEffect, useCallback } from "react";
import { AssetSet } from "@/lib/supabase";
import { normalizeType } from "@/lib/constants";

type Props = {
  set: AssetSet;
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export default function Lightbox({ set, index, onClose, onNavigate }: Props) {
  const images = set.images || [];
  const total = images.length;

  const goPrev = useCallback(() => {
    onNavigate((index - 1 + total) % total);
  }, [index, total, onNavigate]);

  const goNext = useCallback(() => {
    onNavigate((index + 1) % total);
  }, [index, total, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, goPrev, goNext]);

  const types = (
    Array.isArray(set.asset_type) ? set.asset_type : [set.asset_type]
  ).map(normalizeType);
  const badges = [
    set.region,
    ...types,
    set.platform,
    set.category,
    ...(set.tags || []),
  ];

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 bg-white/10 text-white border-none w-10 h-10 rounded-full text-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
        onClick={onClose}
      >
        &times;
      </button>

      {/* Prev */}
      {total > 1 && (
        <button
          className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/10 text-white border-none w-11 h-11 rounded-full text-xl flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
          onClick={goPrev}
        >
          &#8249;
        </button>
      )}

      {/* Next */}
      {total > 1 && (
        <button
          className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/10 text-white border-none w-11 h-11 rounded-full text-xl flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
          onClick={goNext}
        >
          &#8250;
        </button>
      )}

      {/* Image */}
      <img
        className="max-h-[75vh] max-w-[90vw] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        src={images[index]}
        alt={`${set.app_name} ${index + 1}`}
      />

      {/* Info bar */}
      <div className="flex items-center gap-2.5 flex-wrap justify-center mt-4">
        <span className="text-white text-sm font-semibold">
          {set.app_name}
        </span>
        {badges.map((b, i) => (
          <span
            key={`${b}-${i}`}
            className="px-2.5 py-0.5 bg-white/15 text-white text-xs rounded-full"
          >
            {b}
          </span>
        ))}
        <span className="text-white/40 text-xs">
          {index + 1} / {total}
        </span>
      </div>
    </div>
  );
}
