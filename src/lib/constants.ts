export const ASSET_TYPES = [
  "All",
  "Screenshots",
  "Featuring",
  "In-App Events",
  "Icons",
] as const;

export const PLATFORMS = [
  "All",
  "App Store",
  "Play Store",
] as const;

// Top regions by App Store revenue/download volume, then rest alphabetically
export const REGIONS_TOP = [
  "US","CN","JP","GB","DE","KR","FR","BR","MX","IN","CA","AU","IT","ES","RU","TR","SA","NL","SE","CH","TW","ID","TH","PL","NO",
] as const;

export const REGIONS_REST = [
  "AE","AG","AI","AM","AO","AR","AT","AZ",
  "BB","BE","BF","BH","BM","BN","BO","BT","BW","BY","BZ",
  "CG","CI","CL","CM","CO","CR","CV","CY","CZ",
  "DK","DM","DO","DZ",
  "EC","EG","EE","SV","SZ",
  "FI","FJ","FM",
  "GA","GE","GH","GM","GD","GR","GT","GW","GY",
  "HK","HN","HR","HU",
  "IE","IL","IQ","IS",
  "JM","JO",
  "KE","KG","KH","KN","KW","KY","KZ",
  "LA","LB","LC","LK","LR","LT","LU","LY",
  "MA","MD","ME","MG","MK","ML","MM","MN","MO","MR","MT","MU","MV","MW","MZ",
  "NA","NE","NG","NI","NP","NR","NZ",
  "OM",
  "PA","PE","PG","PH","PK","PT","PW","PY",
  "QA",
  "RO","RS","RW",
  "SB","SC","SG","SI","SK","SL","SN","SR","ST",
  "TJ","TN","TO","TM","TT","TZ",
  "UA","UG","UY","UZ",
  "VC","VE","VN","VU",
  "YE",
  "ZA","ZM","ZW",
] as const;

export const REGIONS = ["All", ...REGIONS_TOP, ...REGIONS_REST] as const;

export const CATEGORIES = [
  "All",
  "Books","Business","Developer Tools","Education","Entertainment","Finance",
  "Food & Drink","Games","Graphics & Design","Health & Fitness","Lifestyle",
  "Medical","Music","Navigation","News","Photo & Video","Productivity",
  "Reference","Shopping","Social Networking","Sports","Travel","Utilities","Weather",
  // Play Store extras
  "Art & Design","Auto & Vehicles","Beauty","Comics","Communication","Dating",
  "Events","House & Home","Libraries & Demo","Maps & Navigation","Parenting",
  "Personalization","Photography","Social","Tools","Video Players & Editors",
  "Other",
] as const;

// Badge color maps
export const BADGE_TYPE_MAP: Record<string, string> = {
  Screenshots: "bg-blue-100 text-blue-700",
  Featuring: "bg-purple-100 text-purple-700",
  "In-App Events": "bg-amber-100 text-amber-700",
  Icons: "bg-pink-100 text-pink-700",
};

// Region colors - grouped by continent/area
export const BADGE_REGION_MAP: Record<string, string> = {
  // North America - blue
  US: "bg-blue-600 text-white", CA: "bg-blue-500 text-white", MX: "bg-blue-400 text-white",
  // Europe - indigo/violet
  GB: "bg-indigo-600 text-white", DE: "bg-indigo-500 text-white", FR: "bg-violet-600 text-white",
  IT: "bg-violet-500 text-white", ES: "bg-purple-600 text-white", NL: "bg-purple-500 text-white",
  SE: "bg-indigo-400 text-white", CH: "bg-violet-400 text-white", NO: "bg-purple-400 text-white",
  PL: "bg-indigo-300 text-indigo-900", RU: "bg-slate-600 text-white", TR: "bg-red-500 text-white",
  // East Asia - rose/pink
  CN: "bg-rose-600 text-white", JP: "bg-pink-600 text-white", KR: "bg-rose-500 text-white",
  TW: "bg-pink-500 text-white", HK: "bg-rose-400 text-white", MO: "bg-pink-400 text-white",
  // South/SE Asia - emerald/teal
  IN: "bg-emerald-600 text-white", ID: "bg-teal-600 text-white", TH: "bg-emerald-500 text-white",
  VN: "bg-teal-500 text-white", PH: "bg-emerald-400 text-white", SG: "bg-teal-400 text-white",
  // Middle East - amber/orange
  SA: "bg-amber-600 text-white", AE: "bg-orange-600 text-white", IL: "bg-amber-500 text-white",
  // Oceania - cyan
  AU: "bg-cyan-600 text-white", NZ: "bg-cyan-500 text-white",
  // South America - lime/green
  BR: "bg-lime-600 text-white", AR: "bg-green-600 text-white", CL: "bg-lime-500 text-white",
  CO: "bg-green-500 text-white",
};

export function getRegionBadgeClass(region: string): string {
  return BADGE_REGION_MAP[region] || "bg-gray-600 text-white";
}

export const BADGE_PLATFORM_MAP: Record<string, string> = {
  "App Store": "bg-sky-50 text-sky-700",
  "Play Store": "bg-emerald-50 text-emerald-700",
};

// Normalize legacy type names
export const TYPE_ALIASES: Record<string, string> = {
  "App Screenshots": "Screenshots",
  "App Icon": "Icons",
  "App Preview": "Other",
};

export function normalizeType(t: string): string {
  return TYPE_ALIASES[t] || t;
}
