"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase, AssetSet } from "@/lib/supabase";
import { normalizeType } from "@/lib/constants";
import FilterBar from "@/components/FilterBar";
import ScreenshotGrid from "@/components/ScreenshotGrid";
import UploadModal from "@/components/UploadModal";
import DetailPage from "@/components/DetailPage";
import Lightbox from "@/components/Lightbox";

export type Filters = {
  search: string;
  type: string;
  platform: string;
  region: string;
  category: string;
};

export type ViewMode = "list" | "grid";

const DEFAULT_FILTERS: Filters = {
  search: "",
  type: "Screenshots",
  platform: "All",
  region: "US",
  category: "All",
};

function filtersFromHash(): { filters: Filters; view: ViewMode } {
  if (typeof window === "undefined")
    return { filters: { ...DEFAULT_FILTERS }, view: "grid" };
  const hash = window.location.hash.slice(1);
  if (!hash) return { filters: { ...DEFAULT_FILTERS }, view: "grid" };
  const params = new URLSearchParams(hash);
  return {
    filters: {
      search: params.get("q") || "",
      type: params.get("type") || "Screenshots",
      platform: params.get("platform") || "All",
      region: params.get("region") || "US",
      category: params.get("category") || "All",
    },
    view: (params.get("view") as ViewMode) || "grid",
  };
}

function filtersToHash(filters: Filters, view: ViewMode) {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.type !== "Screenshots") params.set("type", filters.type);
  if (filters.platform !== "All") params.set("platform", filters.platform);
  if (filters.region !== "US") params.set("region", filters.region);
  if (filters.category !== "All") params.set("category", filters.category);
  if (view !== "grid") params.set("view", view);
  const hash = params.toString();
  history.replaceState(null, "", hash ? "#" + hash : window.location.pathname);
}

export default function Home() {
  const [sets, setSets] = useState<AssetSet[]>([]);
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
  const [view, setView] = useState<ViewMode>("grid");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{
    setId: string;
    index: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const importRef = useRef<HTMLInputElement>(null);

  // Init filters from URL hash
  useEffect(() => {
    const { filters: f, view: v } = filtersFromHash();
    setFilters(f);
    setView(v);
  }, []);

  // Sync to hash
  useEffect(() => {
    filtersToHash(filters, view);
  }, [filters, view]);

  // Fetch data from Supabase
  const fetchSets = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("asset_sets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setSets(data || []);
    } catch (e) {
      console.error("Failed to fetch sets:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSets();
  }, [fetchSets]);

  // Filter logic (client-side, matches the HTML app)
  const filtered = sets.filter((s) => {
    const isIconsView = filters.type === "Icons";
    if (filters.type !== "All" && !isIconsView) {
      const types = (
        Array.isArray(s.asset_type) ? s.asset_type : [s.asset_type]
      ).map(normalizeType);
      if (!types.includes(filters.type)) return false;
    }
    if (filters.platform !== "All" && s.platform !== filters.platform)
      return false;
    if (filters.region !== "All" && s.region !== filters.region) return false;
    if (filters.category !== "All" && s.category !== filters.category)
      return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        (s.app_name || "").toLowerCase().includes(q) ||
        (s.tags || []).some((t) => t.toLowerCase().includes(q)) ||
        (s.category || "").toLowerCase().includes(q) ||
        (Array.isArray(s.asset_type) ? s.asset_type : [s.asset_type]).some(
          (t) => t.toLowerCase().includes(q)
        )
      );
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "uhhh?! not the vibes anymore? are you sure you wanna delete this?"
      )
    )
      return;
    const { error } = await supabase.from("asset_sets").delete().eq("id", id);
    if (error) {
      alert("Delete failed: " + error.message);
      return;
    }
    setSets((prev) => prev.filter((s) => s.id !== id));
    if (detailId === id) setDetailId(null);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(sets, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download =
      "screenshot-library-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        for (const item of data) {
          const { error } = await supabase.from("asset_sets").insert(item);
          if (error) console.error("Import item failed:", error);
        }
        await fetchSets();
      }
    } catch {
      alert("Invalid JSON file");
    }
    e.target.value = "";
  };

  const detailSet = detailId ? sets.find((s) => s.id === detailId) : null;
  const lightboxSet = lightbox
    ? sets.find((s) => s.id === lightbox.setId)
    : null;

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#e5e5e7]">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold tracking-tight text-[#1d1d1f]">
              Codeway ASO Design Library
            </h1>
            <span className="text-xs text-[#86868b] mt-0.5">
              {filtered.length} set{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            {/* View toggle */}
            <div className="flex bg-[#f0f0f2] rounded-lg p-0.5 gap-0.5">
              <button
                className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${
                  view === "list"
                    ? "bg-white shadow-sm text-[#1d1d1f]"
                    : "text-[#999] hover:text-[#555]"
                }`}
                onClick={() => setView("list")}
                title="List view"
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="3" y1="4" x2="15" y2="4" />
                  <line x1="3" y1="9" x2="15" y2="9" />
                  <line x1="3" y1="14" x2="15" y2="14" />
                </svg>
              </button>
              <button
                className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${
                  view === "grid"
                    ? "bg-white shadow-sm text-[#1d1d1f]"
                    : "text-[#999] hover:text-[#555]"
                }`}
                onClick={() => setView("grid")}
                title="Grid view"
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <rect x="2" y="2" width="6" height="6" rx="1" />
                  <rect x="10" y="2" width="6" height="6" rx="1" />
                  <rect x="2" y="10" width="6" height="6" rx="1" />
                  <rect x="10" y="10" width="6" height="6" rx="1" />
                </svg>
              </button>
            </div>
            {/* Data actions */}
            <button
              className="px-3.5 py-2 bg-[#f5f5f7] rounded-[10px] text-xs font-medium text-[#555] hover:bg-[#eee] transition-colors"
              onClick={handleExport}
            >
              Export JSON
            </button>
            <button
              className="px-3.5 py-2 bg-[#f5f5f7] rounded-[10px] text-xs font-medium text-[#555] hover:bg-[#eee] transition-colors"
              onClick={() => importRef.current?.click()}
            >
              Import JSON
            </button>
            <input
              ref={importRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <button
              className="px-5 py-2.5 bg-[#1d1d1f] text-white rounded-xl text-sm font-semibold hover:bg-[#333] transition-colors"
              onClick={() => setUploadOpen(true)}
            >
              + Upload Set
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <FilterBar filters={filters} setFilters={setFilters} />

      {/* Content */}
      <div className="max-w-[1600px] mx-auto p-6">
        {loading ? (
          <div className="text-center py-24">
            <p className="text-[#86868b]">Loading...</p>
          </div>
        ) : (
          <ScreenshotGrid
            sets={filtered}
            view={view}
            typeFilter={filters.type}
            onOpenDetail={(id) => setDetailId(id)}
            onOpenLightbox={(setId, index) => setLightbox({ setId, index })}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Upload Modal */}
      {uploadOpen && (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onSaved={fetchSets}
        />
      )}

      {/* Detail Page */}
      {detailSet && (
        <DetailPage
          set={detailSet}
          onClose={() => setDetailId(null)}
          onDelete={handleDelete}
          onOpenLightbox={(index) =>
            setLightbox({ setId: detailSet.id, index })
          }
        />
      )}

      {/* Lightbox */}
      {lightboxSet && lightbox && (
        <Lightbox
          set={lightboxSet}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNavigate={(newIndex) =>
            setLightbox({ setId: lightbox.setId, index: newIndex })
          }
        />
      )}
    </div>
  );
}
