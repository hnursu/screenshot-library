"use client";

import { useEffect } from "react";
import { AssetSet } from "@/lib/supabase";
import { normalizeType, BADGE_TYPE_MAP, BADGE_PLATFORM_MAP } from "@/lib/constants";

type Props = {
  set: AssetSet;
  onClose: () => void;
  onDelete: (id: string) => void;
  onOpenLightbox: (index: number) => void;
};

export default function DetailPage({
  set,
  onClose,
  onDelete,
  onOpenLightbox,
}: Props) {
  const types = (
    Array.isArray(set.asset_type) ? set.asset_type : [set.asset_type]
  ).map(normalizeType);

  // Handle Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[45] bg-[#f5f5f7] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-[2] bg-white/85 backdrop-blur-xl border-b border-[#e5e5e7] px-6 py-4 flex items-center gap-4">
        <button
          className="text-sm font-semibold text-[#007aff] flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-[#f0f0f2] transition-colors"
          onClick={onClose}
        >
          &#8249; Back
        </button>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          {set.icon_url && (
            <img
              className="w-10 h-10 rounded-[10px] object-cover shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
              src={set.icon_url}
              alt=""
            />
          )}
          <div className="min-w-0">
            <span className="text-base font-bold text-[#1d1d1f] block truncate">
              {set.app_name || "Untitled"}
            </span>
            {set.name_en && (
              <span className="text-[11px] text-[#aaa] block">
                en: {set.name_en}
              </span>
            )}
          </div>
        </div>

        <button
          className="text-lg text-[#c7c7cc] hover:text-[#ff3b30] transition-colors"
          onClick={() => onDelete(set.id)}
        >
          &times;
        </button>
      </div>

      {/* Body */}
      <div className="max-w-[1400px] mx-auto p-6">
        {/* Meta badges */}
        <div className="flex gap-2 flex-wrap mb-5 items-center">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#1d1d1f] text-white">
            {set.region}
          </span>
          {types.map((t) => {
            const cls = BADGE_TYPE_MAP[t] || "bg-gray-100 text-gray-500";
            return (
              <span
                key={t}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${cls}`}
              >
                {t}
              </span>
            );
          })}
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${BADGE_PLATFORM_MAP[set.platform] || ""}`}
          >
            {set.platform}
          </span>
          {set.category && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f5f5f7] text-[#86868b]">
              {set.category}
            </span>
          )}
          {set.store_url && (
            <a
              href={set.store_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#007aff] no-underline font-medium"
            >
              View in Store &#8599;
            </a>
          )}
          <span className="text-[11px] text-[#999] ml-auto">
            {(set.images || []).length} images
          </span>
        </div>

        {/* Screenshots */}
        <div className="flex gap-4 flex-wrap">
          {(set.images || []).map((url, i) => (
            <img
              key={i}
              className="h-[420px] w-auto rounded-[14px] cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
              src={url}
              alt={`${set.app_name} ${i + 1}`}
              loading="lazy"
              onClick={() => onOpenLightbox(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
