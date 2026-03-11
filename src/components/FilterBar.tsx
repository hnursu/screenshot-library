"use client";

import { useState, useRef, useEffect } from "react";
import type { Filters } from "@/app/page";
import {
  ASSET_TYPES,
  PLATFORMS,
  REGIONS,
  REGIONS_TOP,
  REGIONS_REST,
  CATEGORIES,
} from "@/lib/constants";

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

type FilterKey = "type" | "platform" | "region" | "category";

const FILTER_CONFIG: {
  key: FilterKey;
  label: string;
  items: readonly string[];
  searchable: boolean;
}[] = [
  { key: "type", label: "Type", items: ASSET_TYPES, searchable: false },
  { key: "platform", label: "Platform", items: PLATFORMS, searchable: false },
  { key: "region", label: "Region", items: REGIONS, searchable: true },
  { key: "category", label: "Category", items: CATEGORIES, searchable: true },
];

export default function FilterBar({ filters, setFilters }: Props) {
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenFilter(null);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Focus search input when searchable dropdown opens
  useEffect(() => {
    if (
      openFilter &&
      (openFilter === "region" || openFilter === "category") &&
      searchInputRef.current
    ) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [openFilter]);

  const selectFilter = (key: FilterKey, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setOpenFilter(null);
    setDropdownSearch("");
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      type: "Screenshots",
      platform: "All",
      region: "US",
      category: "All",
    });
    setOpenFilter(null);
    setDropdownSearch("");
  };

  const toggleFilter = (key: FilterKey) => {
    setOpenFilter((prev) => (prev === key ? null : key));
    setDropdownSearch("");
  };

  const renderDropdownItems = (config: (typeof FILTER_CONFIG)[number]) => {
    const q = dropdownSearch.toLowerCase().trim();

    if (config.key === "region") {
      return (
        <>
          <button
            className={`w-full text-left px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              filters.region === "All"
                ? "bg-[#1d1d1f] text-white"
                : "text-[#333] hover:bg-[#f0f0f2]"
            }`}
            onClick={() => selectFilter("region", "All")}
          >
            All
          </button>
          {!q && <div className="h-px bg-[#e5e5e7] mx-2 my-1" />}
          {(REGIONS_TOP as readonly string[])
            .filter((r) => !q || r.toLowerCase().includes(q))
            .map((r) => (
              <button
                key={r}
                className={`w-full text-left px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  filters.region === r
                    ? "bg-[#1d1d1f] text-white"
                    : "text-[#333] hover:bg-[#f0f0f2]"
                }`}
                onClick={() => selectFilter("region", r)}
              >
                {r}
              </button>
            ))}
          {!q && <div className="h-px bg-[#e5e5e7] mx-2 my-1" />}
          {(REGIONS_REST as readonly string[])
            .filter((r) => !q || r.toLowerCase().includes(q))
            .map((r) => (
              <button
                key={r}
                className={`w-full text-left px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  filters.region === r
                    ? "bg-[#1d1d1f] text-white"
                    : "text-[#333] hover:bg-[#f0f0f2]"
                }`}
                onClick={() => selectFilter("region", r)}
              >
                {r}
              </button>
            ))}
        </>
      );
    }

    return (config.items as readonly string[])
      .filter((item) => !q || item.toLowerCase().includes(q))
      .map((item) => (
        <button
          key={item}
          className={`w-full text-left px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
            filters[config.key] === item
              ? "bg-[#1d1d1f] text-white"
              : "text-[#333] hover:bg-[#f0f0f2]"
          }`}
          onClick={() => selectFilter(config.key, item)}
        >
          {item}
        </button>
      ));
  };

  return (
    <div ref={containerRef} className="max-w-[1600px] mx-auto px-6 pt-5">
      {/* Search */}
      <div className="relative mb-3">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="8" cy="8" r="6" />
          <path d="m14 14 4 4" />
        </svg>
        <input
          className="w-full py-3 pl-[42px] pr-[100px] rounded-[14px] border border-[#e5e5e7] text-sm bg-[#fafafa] outline-none focus:border-[#aaa]"
          type="text"
          placeholder="Search by app name or tag..."
          value={filters.search}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, search: e.target.value }))
          }
        />
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#86868b] px-2 py-1 rounded-lg hover:bg-[#eee] hover:text-[#555] transition-colors"
          onClick={resetFilters}
        >
          Clear all
        </button>
      </div>

      {/* Filter dropdown buttons */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_CONFIG.map((config) => {
          const hasValue = filters[config.key] !== "All";
          const isOpen = openFilter === config.key;
          const displayVal = hasValue ? filters[config.key] : config.label;

          return (
            <div key={config.key} className="relative">
              <button
                className={`px-4 py-[7px] rounded-[10px] text-[13px] font-semibold border-[1.5px] flex items-center gap-1.5 transition-all ${
                  hasValue
                    ? "bg-[#1d1d1f] text-white border-[#1d1d1f]"
                    : isOpen
                      ? "border-[#1d1d1f] text-[#1d1d1f] bg-white"
                      : "border-[#e5e5e7] text-[#555] bg-white hover:border-[#ccc] hover:bg-[#fafafa]"
                }`}
                onClick={() => toggleFilter(config.key)}
              >
                {displayVal}
                <span
                  className={`text-[10px] transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  &#9662;
                </span>
              </button>

              {isOpen && (
                <div className="absolute top-[calc(100%+6px)] left-0 z-30 bg-white border border-[#e5e5e7] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] min-w-[180px] max-h-[300px] overflow-y-auto p-1 scrollbar-hide">
                  {config.searchable && (
                    <input
                      ref={searchInputRef}
                      className="w-[calc(100%-8px)] mx-1 my-1 px-2.5 py-[7px] border border-[#e5e5e7] rounded-lg text-xs outline-none focus:border-[#999] sticky top-1 bg-white z-[1]"
                      type="text"
                      placeholder={
                        config.key === "region"
                          ? "Search region..."
                          : "Search category..."
                      }
                      value={dropdownSearch}
                      onChange={(e) => setDropdownSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  {renderDropdownItems(config)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
