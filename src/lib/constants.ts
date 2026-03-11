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
