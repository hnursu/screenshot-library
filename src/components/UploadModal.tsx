"use client";

import { useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  ASSET_TYPES,
  PLATFORMS,
  REGIONS,
  REGIONS_TOP,
  REGIONS_REST,
  CATEGORIES,
} from "@/lib/constants";
import { fetchFromStore, FetchResult } from "@/lib/store-fetch";

type Props = {
  onClose: () => void;
  onSaved: () => void;
};

// Single-select dropdown component
function SingleSelect({
  label,
  value,
  options,
  onChange,
  grouped,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  grouped?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="field">
      <label className="block text-[13px] font-semibold text-[#555] mb-1.5">
        {label}
      </label>
      <div ref={ref} className="relative">
        <div
          className="px-3.5 py-2.5 border border-[#e5e5e7] rounded-xl text-sm bg-[#f5f5f7] cursor-pointer flex justify-between items-center"
          onClick={() => setOpen(!open)}
        >
          <span className={value ? "text-[#1d1d1f]" : "text-[#999]"}>
            {value || "Select..."}
          </span>
          <span
            className={`text-[10px] text-[#999] transition-transform ${open ? "rotate-180" : ""}`}
          >
            &#9662;
          </span>
        </div>
        {open && (
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-[#e5e5e7] rounded-xl p-1.5 z-10 shadow-[0_4px_16px_rgba(0,0,0,0.1)] max-h-[240px] overflow-y-auto">
            {grouped
              ? // Region grouped: top, separator, rest
                <>
                  {(REGIONS_TOP as readonly string[]).map((item) => (
                    <div
                      key={item}
                      className={`px-3 py-2 rounded-lg text-[13px] cursor-pointer transition-colors ${
                        value === item
                          ? "bg-[#1d1d1f] text-white"
                          : "hover:bg-[#f5f5f7]"
                      }`}
                      onClick={() => {
                        onChange(item);
                        setOpen(false);
                      }}
                    >
                      {item}
                    </div>
                  ))}
                  <div className="h-px bg-[#e5e5e7] mx-2 my-1" />
                  {(REGIONS_REST as readonly string[]).map((item) => (
                    <div
                      key={item}
                      className={`px-3 py-2 rounded-lg text-[13px] cursor-pointer transition-colors ${
                        value === item
                          ? "bg-[#1d1d1f] text-white"
                          : "hover:bg-[#f5f5f7]"
                      }`}
                      onClick={() => {
                        onChange(item);
                        setOpen(false);
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </>
              : (options as readonly string[])
                  .filter((i) => i !== "All")
                  .map((item) => (
                    <div
                      key={item}
                      className={`px-3 py-2 rounded-lg text-[13px] cursor-pointer transition-colors ${
                        value === item
                          ? "bg-[#1d1d1f] text-white"
                          : "hover:bg-[#f5f5f7]"
                      }`}
                      onClick={() => {
                        onChange(item);
                        setOpen(false);
                      }}
                    >
                      {item}
                    </div>
                  ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Multi-select for asset types
function MultiSelect({
  label,
  selected,
  options,
  onChange,
}: {
  label: string;
  selected: string[];
  options: readonly string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  return (
    <div className="field">
      <label className="block text-[13px] font-semibold text-[#555] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div
          className="px-3.5 py-2.5 border border-[#e5e5e7] rounded-xl text-sm bg-[#f5f5f7] cursor-pointer flex justify-between items-center"
          onClick={() => setOpen(!open)}
        >
          <span
            className={
              selected.length > 0 ? "text-[#1d1d1f]" : "text-[#999]"
            }
          >
            {selected.length > 0 ? selected.join(", ") : "Select..."}
          </span>
          <span
            className={`text-[10px] text-[#999] transition-transform ${open ? "rotate-180" : ""}`}
          >
            &#9662;
          </span>
        </div>
        {open && (
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-[#e5e5e7] rounded-xl p-1.5 z-10 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
            {(options as readonly string[])
              .filter((i) => i !== "All")
              .map((item) => (
                <div
                  key={item}
                  className={`px-3 py-2 rounded-lg text-[13px] cursor-pointer flex items-center gap-2 transition-colors ${
                    selected.includes(item)
                      ? "bg-[#1d1d1f] text-white"
                      : "hover:bg-[#f5f5f7]"
                  }`}
                  onClick={() => toggle(item)}
                >
                  <span className="w-4 text-center">
                    {selected.includes(item) ? "\u2713" : ""}
                  </span>
                  {item}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UploadModal({ onClose, onSaved }: Props) {
  // Form state
  const [appName, setAppName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [assetTypes, setAssetTypes] = useState<string[]>([]);
  const [platform, setPlatform] = useState("");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("");

  // Image state - store Apple CDN URLs directly
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  // Fetch state
  const [fetchUrlInput, setFetchUrlInput] = useState("");
  const [fetchStatus, setFetchStatus] = useState("");
  const [fetching, setFetching] = useState(false);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const totalImages = imageUrls.length + files.length;

  // --- Store Fetch ---
  const handleFetch = async () => {
    const url = fetchUrlInput.trim();
    if (!url) {
      setFetchStatus("Please enter a URL");
      return;
    }

    setFetching(true);
    setFetchStatus("Fetching...");
    setImageUrls([]);
    setPreviews([]);
    setFiles([]);

    try {
      const result: FetchResult = await fetchFromStore(url, (msg) =>
        setFetchStatus(msg)
      );

      setAppName(result.appName);
      setNameEn(result.nameEn);
      setSubtitle(result.subtitle);
      setIconUrl(result.iconUrl);
      setStoreUrl(result.storeUrl);
      setAssetTypes(result.assetTypes);
      setPlatform(result.platform);
      setCategory(result.category);

      if (result.region) {
        const allRegions = [...REGIONS_TOP, ...REGIONS_REST] as readonly string[];
        if ((allRegions as readonly string[]).includes(result.region)) {
          setRegion(result.region);
        }
      }

      // Store Apple CDN URLs directly (not base64)
      if (result.screenshots.length > 0) {
        setImageUrls(result.screenshots);
        setPreviews(result.screenshots);
      }

      setFetchStatus(
        `Fetched ${result.screenshots.length} images for "${result.appName}"`
      );
    } catch (err) {
      setFetchStatus(
        "Error: " + (err instanceof Error ? err.message : "Fetch failed")
      );
    } finally {
      setFetching(false);
    }
  };

  // --- Manual file upload ---
  const handleFiles = useCallback((newFiles: File[]) => {
    const imageFiles = newFiles.filter((f) => f.type.startsWith("image/"));
    for (const file of imageFiles) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles((prev) => [...prev, file]);
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const removePreview = (index: number) => {
    if (index < imageUrls.length) {
      // Remove a CDN URL
      setImageUrls((prev) => prev.filter((_, i) => i !== index));
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Remove a manually uploaded file
      const fileIndex = index - imageUrls.length;
      setFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // --- Submit ---
  const handleSubmit = async () => {
    if (totalImages === 0) return;
    setSubmitting(true);

    try {
      // For manually uploaded files, we store them as data URLs
      // For CDN URLs, we use them directly
      const finalImages: string[] = [...imageUrls];

      for (const file of files) {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        finalImages.push(dataUrl);
      }

      const { error } = await supabase.from("asset_sets").insert({
        app_name: appName,
        name_en: nameEn,
        subtitle: subtitle,
        icon_url: iconUrl,
        store_url: storeUrl,
        asset_type: assetTypes,
        platform: platform,
        region: region,
        category: category,
        tags: [],
        images: finalImages,
      });

      if (error) throw error;

      onSaved();
      onClose();
    } catch (err) {
      console.error("Submit failed:", err);
      alert(
        "Error saving: " + (err instanceof Error ? err.message : "Unknown")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-lg p-4">
      <div className="bg-white rounded-3xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[22px] font-extrabold text-[#1d1d1f]">
              Add Asset Set
            </h2>
            <button
              className="text-2xl text-[#86868b] hover:text-[#555] leading-none"
              onClick={onClose}
            >
              &times;
            </button>
          </div>

          {/* Store URL Import */}
          <div className="mb-4">
            <label className="block text-[13px] font-semibold text-[#555] mb-1.5">
              Import from Store URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={fetchUrlInput}
                onChange={(e) => setFetchUrlInput(e.target.value)}
                placeholder="https://apps.apple.com/us/app/... or Play Store URL"
                className="flex-1 px-4 py-3 rounded-xl border-[1.5px] border-[#e5e5e7] text-sm outline-none focus:border-[#007aff]"
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              />
              <button
                className="px-5 py-3 bg-[#007aff] text-white rounded-xl text-sm font-semibold whitespace-nowrap hover:bg-[#0066d6] disabled:opacity-50 transition-colors"
                onClick={handleFetch}
                disabled={fetching}
              >
                {fetching ? "Fetching..." : "Fetch"}
              </button>
            </div>
            {fetchStatus && (
              <p className="text-xs text-[#86868b] mt-1.5">{fetchStatus}</p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#e5e5e7]" />
            <span className="text-xs text-[#c7c7cc] font-medium">
              or upload manually
            </span>
            <div className="flex-1 h-px bg-[#e5e5e7]" />
          </div>

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-[#007aff] bg-[#f0f7ff]"
                : "border-[#d1d1d6] hover:border-[#999]"
            }`}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.multiple = true;
              input.accept = "image/*";
              input.onchange = () => {
                if (input.files) handleFiles(Array.from(input.files));
              };
              input.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(Array.from(e.dataTransfer.files));
            }}
          >
            <div className="text-4xl text-[#d1d1d6] mb-2">+</div>
            <p className="text-[13px] text-[#86868b]">
              Drop all images for this set, or click to browse
            </p>
            <p className="text-xs text-[#c7c7cc] mt-1">
              All images will be saved as one set
            </p>
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1 scrollbar-hide">
              {previews.map((src, i) => (
                <div key={i} className="relative shrink-0">
                  <img
                    src={src}
                    alt=""
                    className="h-[140px] w-auto rounded-xl"
                  />
                  <button
                    className="absolute -top-2 -right-2 bg-[#ff3b30] text-white border-none rounded-full w-[22px] h-[22px] text-xs flex items-center justify-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePreview(i);
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Form fields */}
          <div className="mt-6 flex flex-col gap-3.5">
            {/* App Name */}
            <div>
              <label className="block text-[13px] font-semibold text-[#555] mb-1.5">
                App Name
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g. Instagram, Spotify..."
                className="w-full px-4 py-3 rounded-xl border border-[#e5e5e7] text-sm outline-none focus:border-[#007aff]"
              />
            </div>

            {/* Asset Type, Platform, Region row */}
            <div className="grid grid-cols-3 gap-3">
              <MultiSelect
                label="Asset Type"
                selected={assetTypes}
                options={ASSET_TYPES}
                onChange={setAssetTypes}
              />
              <SingleSelect
                label="Platform"
                value={platform}
                options={PLATFORMS}
                onChange={setPlatform}
              />
              <SingleSelect
                label="Region"
                value={region}
                options={REGIONS}
                onChange={setRegion}
                grouped
              />
            </div>

            {/* Category row */}
            <div className="grid grid-cols-3 gap-3">
              <SingleSelect
                label="Category"
                value={category}
                options={CATEGORIES}
                onChange={setCategory}
              />
            </div>

          </div>

          {/* Submit */}
          <button
            className="mt-7 w-full py-4 bg-[#007aff] text-white text-base font-bold rounded-2xl hover:bg-[#0066d6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            disabled={totalImages === 0 || submitting}
            onClick={handleSubmit}
          >
            {submitting
              ? "Saving..."
              : `Upload Set (${totalImages} image${totalImages !== 1 ? "s" : ""})`}
          </button>
        </div>
      </div>
    </div>
  );
}
