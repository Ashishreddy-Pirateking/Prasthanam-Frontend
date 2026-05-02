import { createDefaultSiteContent } from "../data/defaultSiteContent.js";
import { normalizeCastBatchRecord } from "./castBatches.js";

export const SITE_CONTENT_CACHE_KEY = "prasthanam_public_site_content";
export const SITE_CONTENT_SNAPSHOT_ENDPOINT = "/api/site-content-snapshot";
export const SITE_CONTENT_SNAPSHOT_PATHNAME = "site-content/public.json";

const hashString = (value) => {
  let hash = 0;
  const input = String(value || "");

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
};

const normalizeGovernorName = (value) => String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
const blockedGovernorNames = new Set(["kolati yamini priya"]);
const keepGovernorName = (value) => !blockedGovernorNames.has(normalizeGovernorName(value));

const normalizeCastBatchForSite = (batch) => {
  const normalizedBatch = normalizeCastBatchRecord(batch);
  return {
    ...normalizedBatch,
    governorNames: Array.isArray(normalizedBatch.governorNames)
      ? normalizedBatch.governorNames.map((name) => String(name || "").trim()).filter(keepGovernorName)
      : [],
  };
};

const getNavarasaTemplate = (fallbackNavarasas, incomingRasa, index) => {
  const id = String(incomingRasa?.id || "").trim();
  const exactMatch = fallbackNavarasas.find((rasa) => String(rasa.id) === id);

  if (exactMatch) return exactMatch;
  if (!fallbackNavarasas.length) return {};

  const seed = id || String(index);
  return fallbackNavarasas[hashString(seed) % fallbackNavarasas.length] || {};
};

export const mergeSiteContent = (incoming) => {
  const fallback = createDefaultSiteContent();
  if (!incoming || typeof incoming !== "object") return fallback;
  return {
    ...fallback,
    ...incoming,
    gallery: {
      ...fallback.gallery,
      ...(incoming.gallery || {}),
      images: Array.isArray(incoming.gallery?.images)
        ? incoming.gallery.images
        : fallback.gallery.images,
    },
    timeline:
      Array.isArray(incoming.timeline) && incoming.timeline.length
        ? incoming.timeline
        : fallback.timeline,
    navarasas:
      Array.isArray(incoming.navarasas) && incoming.navarasas.length
        ? incoming.navarasas.map((incomingRasa, index) => {
            const exactFallbackRasa = fallback.navarasas.find((rasa) => String(rasa.id) === String(incomingRasa?.id || "").trim());
            const fallbackRasa = exactFallbackRasa || getNavarasaTemplate(fallback.navarasas, incomingRasa, index);
            return {
              ...fallbackRasa,
              ...incomingRasa,
              glowColor: String(
                incomingRasa?.glowColor || fallbackRasa?.glowColor || fallback.navarasas[0]?.glowColor || "#FFD700"
              ),
              textColor: String(
                incomingRasa?.textColor ||
                  fallbackRasa?.textColor ||
                  fallback.navarasas[0]?.textColor ||
                  "text-[#FFD700]"
              ),
              icon: String(incomingRasa?.icon || fallbackRasa?.icon || fallback.navarasas[0]?.icon || ""),
              // Use backend plays if non-empty, else fallback plays for that rasa
              plays:
                Array.isArray(incomingRasa.plays) && incomingRasa.plays.length
                  ? incomingRasa.plays.map((play) => String(play || "").trim()).filter(Boolean)
                  : Array.isArray(exactFallbackRasa?.plays)
                  ? exactFallbackRasa.plays
                  : [],
            };
          })
        : fallback.navarasas,
    castBatches:
      Array.isArray(incoming.castBatches) && incoming.castBatches.length
        ? incoming.castBatches.map(normalizeCastBatchForSite)
        : fallback.castBatches.map(normalizeCastBatchForSite),
    governors:
      Array.isArray(incoming.governors) && incoming.governors.length
        ? incoming.governors
        : fallback.governors,
    // Always prefer backend latestEvent, only fall back if completely missing
    latestEvent:
      incoming.latestEvent && Object.keys(incoming.latestEvent).length
        ? { ...incoming.latestEvent }
        : fallback.latestEvent,
  };
};

export const normalizeSiteContentDocument = (incoming) => {
  if (!incoming || typeof incoming !== "object") return null;
  if (incoming.siteContent && typeof incoming.siteContent === "object") {
    return {
      ...incoming,
      siteContent: mergeSiteContent(incoming.siteContent),
    };
  }
  return {
    siteContent: mergeSiteContent(incoming),
    source: "raw",
    savedAt: "",
  };
};

export const readCachedSiteContent = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SITE_CONTENT_CACHE_KEY);
    if (!raw) return null;
    return mergeSiteContent(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const writeCachedSiteContent = (content) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      SITE_CONTENT_CACHE_KEY,
      JSON.stringify(mergeSiteContent(content))
    );
  } catch {
    // Ignore storage failures
  }
};
