// Port of the App Store fetch logic from screenshot-library.html

type ParsedURL = {
  type: "app" | "story" | "event" | "playstore" | null;
  appId: string;
  region: string;
  storeUrl: string;
};

export type FetchResult = {
  appName: string;
  nameEn: string;
  subtitle: string;
  iconUrl: string;
  storeUrl: string;
  screenshots: string[];
  assetTypes: string[];
  region: string;
  category: string;
  tags: string[];
  platform: string;
};

function proxyUrl(url: string): string {
  return `/api/proxy?url=${encodeURIComponent(url)}`;
}

export function parseStoreUrl(url: string): ParsedURL {
  const result: ParsedURL = { type: null, appId: "", region: "US", storeUrl: url };

  // App Store story/featuring
  const storyMatch =
    url.match(/apps\.apple\.com\/([a-z]{2})\/(?:iphone|ipad)\/story\/id(\d+)/i) ||
    url.match(/apps\.apple\.com\/(?:iphone|ipad)\/story\/id(\d+)/i);
  if (storyMatch) {
    result.type = "story";
    if (storyMatch.length === 3) {
      result.region = storyMatch[1].toUpperCase();
      result.appId = storyMatch[2];
    } else {
      result.appId = storyMatch[1];
    }
    return result;
  }

  // App Store event (matches both itsct= and eventid= parameters)
  const eventMatch = url.match(
    /apps\.apple\.com\/([a-z]{2})\/app\/[^/]+\/id(\d+)\?.*?(?:itsct|eventid)=([a-zA-Z0-9_-]+)/i
  );
  if (eventMatch) {
    result.type = "event";
    result.region = eventMatch[1].toUpperCase();
    result.appId = eventMatch[2];
    return result;
  }

  // App Store app
  const appMatch = url.match(/apps\.apple\.com\/([a-z]{2})\/app\/[^/]*\/id(\d+)/i);
  if (appMatch) {
    result.type = "app";
    result.region = appMatch[1].toUpperCase();
    result.appId = appMatch[2];
    return result;
  }

  // Play Store
  if (url.includes("play.google.com")) {
    result.type = "playstore";
    const idMatch = url.match(/id=([a-zA-Z0-9_.]+)/);
    if (idMatch) result.appId = idMatch[1];
    return result;
  }

  return result;
}

async function translateText(text: string, fromRegion: string): Promise<string> {
  const langMap: Record<string, string> = {
    JP: "ja", KR: "ko", CN: "zh", TW: "zh-TW", DE: "de", FR: "fr",
    BR: "pt", MX: "es", ES: "es", IT: "it", RU: "ru", TR: "tr",
    SA: "ar", TH: "th", ID: "id", VN: "vi", PL: "pl", NL: "nl",
    SE: "sv", NO: "no",
  };
  const sl = langMap[fromRegion];
  if (!sl) return "";

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const resp = await fetch(proxyUrl(url));
    const data = await resp.json();
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      const translated = data[0][0][0];
      if (translated.toLowerCase() !== text.toLowerCase()) return translated;
    }
  } catch {
    // ignore translation errors
  }
  return "";
}

export async function fetchFromStore(
  url: string,
  onStatus: (msg: string) => void
): Promise<FetchResult> {
  const parsed = parseStoreUrl(url);
  const result: FetchResult = {
    appName: "",
    nameEn: "",
    subtitle: "",
    iconUrl: "",
    storeUrl: url,
    screenshots: [],
    assetTypes: ["Screenshots"],
    region: parsed.region,
    category: "Other",
    tags: [],
    platform: "App Store",
  };

  if (parsed.type === "playstore") {
    result.platform = "Play Store";
    onStatus("Play Store detected — please upload screenshots manually.");
    return result;
  }

  if (!parsed.appId) {
    throw new Error("Could not parse App Store URL");
  }

  // --- Story/Featuring flow ---
  if (parsed.type === "story") {
    onStatus("Fetching story page...");
    const pageResp = await fetch(proxyUrl(`https://apps.apple.com/${parsed.region.toLowerCase()}/iphone/story/id${parsed.appId}`));
    const pageHtml = await pageResp.text();

    // Extract story title
    const titleMatch = pageHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    let storyTitle = titleMatch ? titleMatch[1].trim() : "Untitled Story";
    storyTitle = storyTitle.replace(/ - Apple$/, "").replace(/ - App Store$/, "").trim();

    const translated = await translateText(storyTitle, parsed.region);
    result.appName = storyTitle;
    result.nameEn = translated;
    result.assetTypes = ["Featuring"];

    // Extract the card/cover image from og:image meta tag
    const ogMatch = pageHtml.match(/<meta\s+property="og:image"\s+content="(https:\/\/is\d+-ssl\.mzstatic\.com\/image\/thumb\/[^"]+)"/i);
    if (ogMatch) {
      let base = ogMatch[1].replace(/\/[^/]*$/, "");
      result.screenshots.push(base + "/1050x1400sr.webp");
    }

    // Check for In-App Events
    if (pageHtml.includes("In-App Events") || pageHtml.includes("in-app-event")) {
      result.assetTypes.push("In-App Events");
    }

    onStatus(`Fetched ${result.screenshots.length} featuring images for "${storyTitle}"`);
    return result;
  }

  // --- Event flow ---
  if (parsed.type === "event") {
    const country = parsed.region.toLowerCase();
    onStatus("Fetching in-app event...");

    // Get app info first
    const lookupUrl = `https://itunes.apple.com/lookup?id=${parsed.appId}&country=${country}`;
    const lookupResp = await fetch(proxyUrl(lookupUrl));
    const lookupData = await lookupResp.json();

    if (lookupData.results && lookupData.results.length > 0) {
      const app = lookupData.results[0];
      result.appName = app.trackName || "";
      result.iconUrl = app.artworkUrl512 || app.artworkUrl100 || "";
      result.subtitle = app.subtitle || "";
      result.category = app.primaryGenreName || "Other";
    }

    result.assetTypes = ["In-App Events", "Featuring"];
    result.storeUrl = url;

    const translated = await translateText(result.appName, parsed.region);
    result.nameEn = translated;

    // Scrape the event page for images
    try {
      const pageResp = await fetch(proxyUrl(parsed.storeUrl));
      const pageHtml = await pageResp.text();

      // Extract all unique mzstatic base paths from the page
      // Matches URLs like: https://is1-ssl.mzstatic.com/image/thumb/HASH/SIZExSIZEsuffix.ext
      const urlRegex = /https:\/\/is\d+-ssl\.mzstatic\.com\/image\/thumb\/([^"'\s);,]+?)\/(\d+)x(\d+)[a-z]*(?:-\d+)?\.(?:webp|jpg|png)/g;
      let match;
      const bases = new Map<string, { w: number; h: number }>();

      while ((match = urlRegex.exec(pageHtml)) !== null) {
        const basePath = match[1];
        const w = parseInt(match[2]);
        const h = parseInt(match[3]);
        // Keep the largest version of each base
        const existing = bases.get(basePath);
        if (!existing || w * h > existing.w * existing.h) {
          bases.set(basePath, { w, h });
        }
      }

      // Also find template URLs with {w}x{h} placeholders
      const tplRegex = /https:\/\/is\d+-ssl\.mzstatic\.com\/image\/thumb\/([^"'\s}]+?)\/\{w\}x\{h\}/g;
      while ((match = tplRegex.exec(pageHtml)) !== null) {
        const basePath = match[1];
        if (!bases.has(basePath)) {
          // Guess landscape for event cards, skip icons
          if (basePath.includes("AppIcon")) continue;
          bases.set(basePath, { w: 1200, h: 630 });
        }
      }

      const allImages: { url: string; w: number; h: number }[] = [];
      for (const [basePath, { w, h }] of bases) {
        if (basePath.includes("AppIcon")) continue;
        const imgUrl = `https://is1-ssl.mzstatic.com/image/thumb/${basePath}/${w}x${h}sr.webp`;
        allImages.push({ url: imgUrl, w, h });
      }

      // Separate landscape (event card) and portrait (event detail) images
      const eventImages = allImages.filter((s) => s.w > s.h && s.w >= 300);
      const portraitImages = allImages.filter(
        (s) => s.w < s.h && s.w >= 300 && s.h >= 500
      );

      // Event card first, then portrait detail
      const combined = [...eventImages, ...portraitImages];
      if (combined.length > 0) {
        result.screenshots = combined.map((s) => s.url);
      } else if (allImages.length > 0) {
        result.screenshots = allImages.filter((s) => s.w >= 200).map((s) => s.url);
      }
    } catch {
      // Page scraping failed
    }

    onStatus(`Fetched ${result.screenshots.length} event images for "${result.appName}"`);
    return result;
  }

  // --- App flow ---
  const country = parsed.region.toLowerCase();
  onStatus("Looking up app info...");

  // Step 1: iTunes API lookup
  const lookupUrl = `https://itunes.apple.com/lookup?id=${parsed.appId}&country=${country}`;
  const lookupResp = await fetch(proxyUrl(lookupUrl));
  const lookupData = await lookupResp.json();

  let appName = "";
  let genre = "";
  let iconUrl = "";
  let subtitle = "";
  let artistName = "";

  if (lookupData.results && lookupData.results.length > 0) {
    const app = lookupData.results[0];
    appName = app.trackName || "";
    genre = app.primaryGenreName || "";
    iconUrl = app.artworkUrl512 || app.artworkUrl100 || "";
    artistName = app.artistName || "";
    subtitle = app.subtitle || "";
  }

  result.appName = appName;
  result.iconUrl = iconUrl;
  result.subtitle = subtitle;
  result.category = genre || "Other";
  result.storeUrl = `https://apps.apple.com/${country}/app/id${parsed.appId}`;

  if (artistName) result.tags.push(artistName.toLowerCase());
  if (genre) result.tags.push(genre.toLowerCase());

  // Translate if non-English region
  const translated = await translateText(appName, parsed.region);
  result.nameEn = translated;

  // Step 2: Scrape App Store page for full screenshot set
  onStatus(appName ? `Found "${appName}", fetching screenshots...` : "Fetching screenshots...");

  try {
    const pageUrl = `https://apps.apple.com/${country}/app/id${parsed.appId}`;
    const pageResp = await fetch(proxyUrl(pageUrl));
    const pageHtml = await pageResp.text();

    // Parse embedded JSON for screenshot URLs with dimensions
    const templateRegex = /"template"\s*:\s*"(https:\/\/is\d+-ssl\.mzstatic\.com\/image\/thumb\/(?:Purple|PurpleSource)[^"]+)"\s*,\s*"width"\s*:\s*(\d+)\s*,\s*"height"\s*:\s*(\d+)/g;
    let match;
    const screenshots: { url: string; w: number; h: number }[] = [];

    while ((match = templateRegex.exec(pageHtml)) !== null) {
      const tpl = match[1];
      const w = parseInt(match[2]);
      const h = parseInt(match[3]);
      let base = tpl;
      if (base.includes("{w}")) base = base.replace(/\/\{w\}.*$/, "");
      else base = base.replace(/\/[^/]*$/, "");
      const full = base + `/${w}x${h}sr.webp`;
      if (!screenshots.some((s) => s.url === full)) {
        screenshots.push({ url: full, w, h });
      }
    }

    // Filter iPhone screenshots (portrait, not too wide = not iPad)
    const iphoneScreenshots = screenshots.filter(
      (s) => s.w < s.h && s.w >= 300 && s.w <= 1400 && s.h >= 500
    );

    if (iphoneScreenshots.length > 0) {
      result.screenshots = iphoneScreenshots.map((s) => s.url);
    } else if (screenshots.length > 0) {
      result.screenshots = screenshots.map((s) => s.url);
    }
  } catch {
    // Page scraping failed
  }

  // Fallback to iTunes API screenshots
  if (result.screenshots.length === 0 && lookupData.results && lookupData.results.length > 0) {
    const app = lookupData.results[0];
    result.screenshots = [...(app.screenshotUrls || [])];
  }

  onStatus(`Fetched ${result.screenshots.length} screenshots for "${appName}"`);
  return result;
}
