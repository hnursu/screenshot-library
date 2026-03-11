"use client";

import { useEffect, useRef } from "react";
import { AssetSet } from "@/lib/supabase";
import {
  normalizeType,
  BADGE_TYPE_MAP,
  BADGE_PLATFORM_MAP,
  getRegionBadgeClass,
} from "@/lib/constants";
import type { ViewMode } from "@/app/page";

type Props = {
  sets: AssetSet[];
  view: ViewMode;
  typeFilter: string;
  onOpenDetail: (id: string) => void;
  onOpenLightbox: (setId: string, index: number) => void;
  onDelete: (id: string) => void;
};

function TypeBadge({ type }: { type: string }) {
  const cls = BADGE_TYPE_MAP[type] || "bg-gray-100 text-gray-500";
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${cls}`}
    >
      {type}
    </span>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  const cls = BADGE_PLATFORM_MAP[platform] || "";
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${cls}`}
    >
      {platform}
    </span>
  );
}

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <button
      className="absolute top-2 right-2 z-[3] opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full bg-black/45 text-white border-none text-base flex items-center justify-center transition-opacity hover:!bg-[#ff3b30] cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
    >
      &times;
    </button>
  );
}

// --- List View Card ---
function ListCard({
  set,
  onOpenLightbox,
  onDelete,
}: {
  set: AssetSet;
  onOpenLightbox: (index: number) => void;
  onDelete: () => void;
}) {
  const imagesRef = useRef<HTMLDivElement>(null);
  const types = (
    Array.isArray(set.asset_type) ? set.asset_type : [set.asset_type]
  ).map(normalizeType);

  useEffect(() => {
    const container = imagesRef.current;
    if (!container) return;
    const imgs = Array.from(
      container.querySelectorAll("img")
    ) as HTMLImageElement[];
    if (imgs.length === 0) return;

    const equalize = () => {
      imgs.forEach((img) => {
        img.style.height = "";
        img.style.width = "";
      });
      let maxH = 0;
      for (const img of imgs) {
        if (img.naturalHeight > maxH) maxH = img.naturalHeight;
      }
      const screenshotCapH = ((window.innerWidth - 108) / 6) * 2.167;
      const fewImageCapH = 400;
      const capH = imgs.length > 2 ? screenshotCapH : fewImageCapH;
      const targetH = Math.min(maxH, capH);
      for (const img of imgs) {
        img.style.height = targetH + "px";
        img.style.width = "auto";
      }
    };

    let loaded = 0;
    const total = imgs.length;
    const onLoad = () => {
      loaded++;
      if (loaded >= total) equalize();
    };
    imgs.forEach((img) => {
      if (img.complete && img.naturalHeight > 0) onLoad();
      else {
        img.addEventListener("load", onLoad);
        img.addEventListener("error", onLoad);
      }
    });
  }, [set.images]);

  return (
    <div className="group relative bg-white rounded-2xl border border-[#e5e5e7] mb-4 w-fit max-w-full transition-all hover:border-[#ccc] hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <DeleteButton onDelete={onDelete} />
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          {set.icon_url && (
            <img
              className="w-12 h-12 rounded-xl shrink-0 object-cover shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
              src={set.icon_url}
              alt=""
            />
          )}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-bold text-[#1d1d1f]">
              {set.app_name || "Untitled"}
            </span>
            {set.name_en && (
              <span className="text-[11px] text-[#aaa] whitespace-nowrap overflow-hidden text-ellipsis max-w-[400px]">
                en: {set.name_en}
              </span>
            )}
            {set.subtitle && (
              <span className="text-[11px] text-[#86868b] whitespace-nowrap overflow-hidden text-ellipsis max-w-[400px]">
                {set.subtitle}
              </span>
            )}
            <span className="text-[11px] text-[#999] font-medium">
              {set.created_at
                ? new Date(set.created_at).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${getRegionBadgeClass(set.region)}`}>
            {set.region}
          </span>
          {types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
          <PlatformBadge platform={set.platform} />
          {set.store_url && (
            <a
              className="text-[11px] text-[#007aff] no-underline font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
              href={set.store_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              View in Store &#8599;
            </a>
          )}
        </div>
      </div>
      <div className="overflow-x-auto px-5 pb-4 scrollbar-hide">
        <div ref={imagesRef} className="inline-flex gap-3 items-end">
          {(set.images || []).map((url, i) => (
            <img
              key={i}
              className="rounded-xl shrink-0 cursor-pointer shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
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

// --- Grid View Card ---
function GridCard({
  set,
  onOpenDetail,
  onDelete,
}: {
  set: AssetSet;
  onOpenDetail: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="group relative bg-white rounded-2xl border border-[#e5e5e7] cursor-pointer overflow-hidden transition-all hover:border-[#999] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
      onClick={onOpenDetail}
    >
      <DeleteButton onDelete={onDelete} />
      <div className="px-3 pt-2.5 pb-1.5">
        <div className="flex items-center gap-2.5">
          {set.icon_url && (
            <img
              className="w-8 h-8 rounded-lg shrink-0 object-cover shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
              src={set.icon_url}
              alt=""
            />
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#1d1d1f] truncate">
              {set.app_name || "Untitled"}
            </span>
            <div className="flex gap-1 flex-wrap mt-0.5">
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${getRegionBadgeClass(set.region)}`}>
                {set.region}
              </span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#f5f5f7] text-[#86868b]">
                {set.category}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-2 pb-2 overflow-x-auto scrollbar-hide h-[300px]">
        <div className="flex gap-2 flex-nowrap h-full items-end">
          {(set.images || []).map((url, i) => (
            <img
              key={i}
              className="h-full w-auto shrink-0 rounded-[10px]"
              src={url}
              alt={`${set.app_name} ${i + 1}`}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Icons View ---
function IconsView({
  sets,
  onOpenDetail,
}: {
  sets: AssetSet[];
  onOpenDetail: (id: string) => void;
}) {
  const iconsWithData = sets.filter((s) => s.icon_url);
  if (iconsWithData.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-5xl opacity-15 mb-4">+</div>
        <p className="text-[#86868b] text-lg">No icons yet</p>
      </div>
    );
  }

  const groups: Record<string, AssetSet[]> = {};
  for (const s of iconsWithData) {
    const cat = s.category || "Other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(s);
  }

  const catKeys = Object.keys(groups).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });

  return (
    <div>
      {catKeys.map((cat) => (
        <div key={cat} className="mb-7">
          <div className="text-[15px] font-bold text-[#1d1d1f] mb-3 flex items-center gap-2">
            {cat}
            <span className="text-xs font-medium text-[#86868b] bg-[#f5f5f7] px-2 py-0.5 rounded-[10px]">
              {groups[cat].length}
            </span>
          </div>
          <div className="flex flex-wrap gap-5">
            {groups[cat].map((s) => (
              <div
                key={s.id}
                className="group/icon flex flex-col items-center gap-2 cursor-pointer w-[88px]"
                onClick={() => onOpenDetail(s.id)}
              >
                <img
                  className="w-[88px] h-[88px] rounded-[20px] object-cover shadow-[0_1px_4px_rgba(0,0,0,0.08)] transition-all group-hover/icon:scale-105 group-hover/icon:shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
                  src={s.icon_url}
                  alt={s.app_name}
                  title={s.app_name}
                />
                <span className="text-[11px] text-[#86868b] text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-full opacity-0 group-hover/icon:opacity-100 transition-opacity">
                  {s.app_name}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Featuring View ---
function FeaturingView({
  sets,
  onOpenDetail,
  onDelete,
}: {
  sets: AssetSet[];
  onOpenDetail: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const RATIO_PORTRAIT = 0.75;
  const RATIO_LANDSCAPE = 1.75;

  const items = sets.map((s) => {
    const types = (
      Array.isArray(s.asset_type) ? s.asset_type : [s.asset_type]
    ).map(normalizeType);
    const isIAE = types.includes("In-App Events");
    return { s, isIAE, ratio: isIAE ? RATIO_LANDSCAPE : RATIO_PORTRAIT };
  });

  // Pack into rows: 4 portrait, or 2 portrait + 1 landscape, or 2 landscape
  const rows: typeof items[] = [];
  const normals = items.filter((i) => !i.isIAE);
  const iaes = items.filter((i) => i.isIAE);
  let ni = 0,
    ii = 0;
  while (ni < normals.length || ii < iaes.length) {
    if (ni + 4 <= normals.length) {
      rows.push([normals[ni++], normals[ni++], normals[ni++], normals[ni++]]);
    } else if (ni + 2 <= normals.length && ii < iaes.length) {
      rows.push([normals[ni++], normals[ni++], iaes[ii++]]);
    } else if (ii + 2 <= iaes.length) {
      rows.push([iaes[ii++], iaes[ii++]]);
    } else if (ni < normals.length) {
      const row: typeof items = [];
      while (ni < normals.length) row.push(normals[ni++]);
      rows.push(row);
    } else if (ii < iaes.length) {
      rows.push([iaes[ii++]]);
    }
  }

  return (
    <div>
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-4 mb-4" style={{ maxHeight: 420 }}>
          {row.map(({ s, ratio }) => {
            const cover = s.images?.[0] || "";
            return (
              <div
                key={s.id}
                className="group relative cursor-pointer rounded-2xl overflow-hidden bg-white border border-[#e5e5e7] transition-all hover:border-[#999] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] min-w-0 flex flex-col"
                style={{ flex: `${ratio} 1 0%`, maxWidth: row.length === 1 ? "50%" : undefined }}
                onClick={() => onOpenDetail(s.id)}
              >
                <DeleteButton onDelete={() => onDelete(s.id)} />
                {cover && (
                  <img
                    className="w-full block flex-1 min-h-0 object-cover"
                    src={cover}
                    alt={s.app_name}
                    loading="lazy"
                  />
                )}
                <div className="px-3 py-2.5">
                  <span className="text-[13px] font-semibold text-[#1d1d1f] whitespace-nowrap overflow-hidden text-ellipsis block">
                    {s.app_name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// --- Main Component ---
export default function ScreenshotGrid({
  sets,
  view,
  typeFilter,
  onOpenDetail,
  onOpenLightbox,
  onDelete,
}: Props) {
  if (sets.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-5xl opacity-15 mb-4">+</div>
        <p className="text-[#86868b] text-lg">No asset sets yet</p>
        <p className="text-[#86868b] text-sm mt-1">
          Upload screenshots, featuring images, or in-app events
        </p>
      </div>
    );
  }

  if (typeFilter === "Icons") {
    return <IconsView sets={sets} onOpenDetail={onOpenDetail} />;
  }

  if (typeFilter === "Featuring") {
    return (
      <FeaturingView
        sets={sets}
        onOpenDetail={onOpenDetail}
        onDelete={onDelete}
      />
    );
  }

  if (view === "grid") {
    return (
      <div className="grid grid-cols-3 gap-3.5">
        {sets.map((s) => (
          <GridCard
            key={s.id}
            set={s}
            onOpenDetail={() => onOpenDetail(s.id)}
            onDelete={() => onDelete(s.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      {sets.map((s) => (
        <ListCard
          key={s.id}
          set={s}
          onOpenLightbox={(index) => onOpenLightbox(s.id, index)}
          onDelete={() => onDelete(s.id)}
        />
      ))}
    </div>
  );
}
