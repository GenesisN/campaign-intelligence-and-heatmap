export const CAMPAIGN_AREAS = [
  "oceans",
  "water",
  "biodiversity",
  "forests",
  "climate-energy",
  "plastics",
  "oil-gas",
  "food-sovereignty",
] as const;

export const AFRICAN_COUNTRIES = new Set([
  "algeria",
  "angola",
  "benin",
  "botswana",
  "burkina faso",
  "burundi",
  "cabo verde",
  "cameroon",
  "central african republic",
  "chad",
  "comoros",
  "congo",
  "democratic republic of the congo",
  "djibouti",
  "egypt",
  "equatorial guinea",
  "eritrea",
  "eswatini",
  "ethiopia",
  "gabon",
  "gambia",
  "ghana",
  "guinea",
  "guinea-bissau",
  "ivory coast",
  "cote d'ivoire",
  "kenya",
  "lesotho",
  "liberia",
  "libya",
  "madagascar",
  "malawi",
  "mali",
  "mauritania",
  "mauritius",
  "morocco",
  "mozambique",
  "namibia",
  "niger",
  "nigeria",
  "rwanda",
  "sao tome and principe",
  "senegal",
  "seychelles",
  "sierra leone",
  "somalia",
  "south africa",
  "south sudan",
  "sudan",
  "tanzania",
  "togo",
  "tunisia",
  "uganda",
  "zambia",
  "zimbabwe",
]);

export interface MentionTarget {
  label: string;
  kind: "brand" | "domain" | "campaigner" | "article";
  query: string;
}

export const MAX_CUSTOM_MENTION_TARGETS = 20;

export const MENTION_QUERY_VARIANTS = [
  {
    id: "web",
    suffix: "Africa environment campaign",
  },
  {
    id: "social",
    suffix: '(site:x.com OR site:twitter.com OR site:facebook.com OR site:instagram.com) Africa',
  },
  {
    id: "forum",
    suffix: '(site:reddit.com OR site:medium.com OR site:substack.com) Africa',
  },
  {
    id: "video",
    suffix: "(site:youtube.com) Africa",
  },
] as const;

export const DEFAULT_MENTION_TARGETS: MentionTarget[] = [
  {
    label: "Greenpeace Africa",
    kind: "brand",
    query: "\"Greenpeace Africa\" Africa environment campaign",
  },
  {
    label: "greenpeaceafrica.org",
    kind: "domain",
    query: "\"greenpeaceafrica.org\" Africa",
  },
  {
    label: "Greenpeace Africa campaigners",
    kind: "campaigner",
    query: "\"Greenpeace Africa\" campaigner OR spokesperson OR activist Africa",
  },
];
