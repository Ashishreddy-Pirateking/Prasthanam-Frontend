import { useEffect, useMemo, useState } from "react";
import logo from "../Legacy/logo.png";
import stageImg from "../Legacy/stage.jpg";
import { CAST_BATCHES } from "../data/legacyData";
import { useSiteContent } from "../context/SiteContentContext";
import { resolveMediaUrl } from "../utils/media";

const cleanString = (value) => String(value || "").trim();

const toUniqueStrings = (items) => {
  const seen = new Set();
  return (Array.isArray(items) ? items : [])
    .map((item) => cleanString(item))
    .filter((item) => {
      if (!item || seen.has(item)) return false;
      seen.add(item);
      return true;
    });
};

const normalizeBatchId = (value) => cleanString(value);
const BLOCKED_GOVERNOR_NAMES = new Set(["kolati yamini priya"]);
const normalizeGovernorName = (value) => cleanString(value).replace(/\s+/g, " ").toLowerCase();

const tokenizeName = (value) =>
  cleanString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);

const compactName = (value) =>
  cleanString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const getEditDistance = (first, second) => {
  const rows = first.length + 1;
  const cols = second.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let row = 0; row < rows; row += 1) matrix[row][0] = row;
  for (let col = 0; col < cols; col += 1) matrix[0][col] = col;

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = first[row - 1] === second[col - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost
      );
    }
  }

  return matrix[first.length][second.length];
};

const tokensLooselyMatch = (firstToken, secondToken) => {
  if (!firstToken || !secondToken) return false;
  if (firstToken === secondToken) return true;
  if (firstToken.length >= 4 && secondToken.length >= 4) {
    if (firstToken.includes(secondToken) || secondToken.includes(firstToken)) return true;
  }
  if (firstToken.length >= 3 && secondToken.length >= 3) {
    if (firstToken.startsWith(secondToken) || secondToken.startsWith(firstToken)) return true;
  }
  const distance = getEditDistance(firstToken, secondToken);
  if (Math.max(firstToken.length, secondToken.length) >= 6) return distance <= 2;
  return distance <= 1;
};

const tokenSetsLooselyMatch = (firstTokens, secondTokens) => {
  const [smaller, larger] =
    firstTokens.length <= secondTokens.length
      ? [firstTokens, secondTokens]
      : [secondTokens, firstTokens];
  const usedIndexes = new Set();

  return smaller.every((token) => {
    const matchIndex = larger.findIndex(
      (candidate, index) => !usedIndexes.has(index) && tokensLooselyMatch(token, candidate)
    );
    if (matchIndex < 0) return false;
    usedIndexes.add(matchIndex);
    return true;
  });
};

const namesMatch = (first, second) => {
  const firstTokens = tokenizeName(first);
  const secondTokens = tokenizeName(second);
  if (!firstTokens.length || !secondTokens.length) return false;

  const firstCompact = compactName(first);
  const secondCompact = compactName(second);
  if (!firstCompact || !secondCompact) return false;
  if (firstCompact === secondCompact) return true;
  if (firstCompact.includes(secondCompact) || secondCompact.includes(firstCompact)) return true;
  if (
    firstCompact[0] === secondCompact[0] &&
    firstCompact[firstCompact.length - 1] === secondCompact[secondCompact.length - 1] &&
    getEditDistance(firstCompact, secondCompact) <= 2
  ) {
    return true;
  }

  const [smaller, larger] =
    firstTokens.length <= secondTokens.length
      ? [firstTokens, secondTokens]
      : [secondTokens, firstTokens];

  const largerSet = new Set(larger);
  if (smaller.every((token) => largerSet.has(token))) return true;
  if (
    firstTokens.length >= 2 &&
    secondTokens.length >= 2 &&
    firstTokens.slice(-2).join(" ") === secondTokens.slice(-2).join(" ")
  ) {
    return true;
  }

  return tokenSetsLooselyMatch(firstTokens, secondTokens);
};

const mergeCastBatches = (incomingBatches, fallbackBatches) => {
  const normalizedIncoming = Array.isArray(incomingBatches) ? incomingBatches.filter(Boolean) : [];
  const incomingMap = new Map(
    normalizedIncoming
      .map((batch) => [normalizeBatchId(batch?.id), batch])
      .filter(([id]) => id)
  );
  const fallbackIds = new Set();

  const mergedFallbackBatches = fallbackBatches.map((fallbackBatch) => {
    const batchId = normalizeBatchId(fallbackBatch.id);
    const incomingBatch = incomingMap.get(batchId);
    const fallbackMembers = toUniqueStrings(fallbackBatch.members);
    const incomingMembers = toUniqueStrings(incomingBatch?.members);
    const incomingGovernorNames = toUniqueStrings(incomingBatch?.governorNames);
    const useIncomingBatch = incomingMembers.length >= fallbackMembers.length && incomingMembers.length > 0;

    fallbackIds.add(batchId);

    return {
      ...fallbackBatch,
      ...(useIncomingBatch ? incomingBatch : {}),
      id: batchId,
      label:
        useIncomingBatch && cleanString(incomingBatch?.label)
          ? cleanString(incomingBatch.label)
          : fallbackBatch.label,
      yearRange:
        useIncomingBatch && cleanString(incomingBatch?.yearRange)
          ? cleanString(incomingBatch.yearRange)
          : fallbackBatch.yearRange,
      members: useIncomingBatch ? incomingMembers : fallbackMembers,
      governorNames: incomingGovernorNames.length
        ? incomingGovernorNames
        : toUniqueStrings(fallbackBatch.governorNames),
      photos: toUniqueStrings(incomingBatch?.photos).length
        ? toUniqueStrings(incomingBatch?.photos)
        : toUniqueStrings(fallbackBatch.photos),
    };
  });

  const extraIncomingBatches = normalizedIncoming
    .filter((batch) => !fallbackIds.has(normalizeBatchId(batch?.id)))
    .map((batch) => {
      const batchId = normalizeBatchId(batch?.id);
      return {
        ...batch,
        id: batchId,
        label: cleanString(batch?.label) || `Batch of ${batchId}`,
        yearRange: cleanString(batch?.yearRange),
        members: toUniqueStrings(batch?.members),
        governorNames: toUniqueStrings(batch?.governorNames),
        photos: toUniqueStrings(batch?.photos),
      };
    });

  return [...mergedFallbackBatches, ...extraIncomingBatches].sort(
    (firstBatch, secondBatch) => Number(secondBatch.id) - Number(firstBatch.id)
  );
};

export default function CastPage() {
  const { siteContent } = useSiteContent();
  const castBatches = useMemo(
    () => mergeCastBatches(siteContent?.castBatches, CAST_BATCHES),
    [siteContent?.castBatches]
  );
  const [activeBatchId, setActiveBatchId] = useState(() => castBatches[0].id);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showBatchGallery, setShowBatchGallery] = useState(false);
  const [selectedBatchPhoto, setSelectedBatchPhoto] = useState(null);
  const safeActiveBatchId = castBatches.some((batch) => batch.id === activeBatchId)
    ? activeBatchId
    : castBatches[0].id;

  const activeBatch = useMemo(
    () => castBatches.find((batch) => batch.id === safeActiveBatchId) || castBatches[0],
    [safeActiveBatchId, castBatches]
  );

  const activePhotos = useMemo(
    () => (activeBatch.photos || []).map((key) => resolveMediaUrl(key)).filter(Boolean),
    [activeBatch]
  );
  const safeSlideIndex = activePhotos.length > 0 ? slideIndex % activePhotos.length : 0;

  const activeGovernorNames = useMemo(
    () =>
      toUniqueStrings(activeBatch.governorNames).filter(
        (name) => !BLOCKED_GOVERNOR_NAMES.has(normalizeGovernorName(name))
      ),
    [activeBatch]
  );

  useEffect(() => {
    if (!showBatchGallery && selectedBatchPhoto) {
      setSelectedBatchPhoto(null);
    }
  }, [selectedBatchPhoto, showBatchGallery]);

  useEffect(() => {
    if (activePhotos.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % activePhotos.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activePhotos]);

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img src={stageImg} alt="Stage Backdrop" className="w-full h-full object-cover hero-zoom" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,215,0,0.16),transparent_60%)]" />

      <nav className="relative z-20 bg-black/80 backdrop-blur-md border-b border-[#333] py-4 px-6 flex justify-start items-center gap-4">
        <a href="/">
          <img className="logo" src={logo} alt="Prasthanam logo" />
        </a>
        <a
          href="/?skipCurtain=1&fromCast=1#team"
          className="px-4 py-2 border border-[#FFD700]/40 rounded-md text-[#FFD700] font-cinzel tracking-[0.18em] text-xs uppercase hover:bg-[#FFD700] hover:text-black transition-all duration-300"
        >
          Back to Stage
        </a>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center mb-10">
          <p className="text-xs md:text-sm text-[#e2c4a4] font-cinzel tracking-[0.3em] uppercase mb-3">Prasthanam Ensemble</p>
          <h1 className="text-4xl md:text-6xl font-cinzel text-[#FFD700] tracking-[0.2em] uppercase mb-4">The Cast</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            The Family of Prasthanam through years
          </p>
        </div>

        <div className="bg-black/45 border border-[#FFD700]/20 rounded-2xl p-4 md:p-6 shadow-[0_0_40px_rgba(255,215,0,0.12)] mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {castBatches.map((batch) => {
              const isActive = batch.id === activeBatch.id;
              return (
                <button
                  key={batch.id}
                  onClick={() => {
                    setActiveBatchId(batch.id);
                    setSlideIndex(0);
                  }}
                  className={`px-5 py-2 rounded-full border text-sm md:text-base tracking-wider transition-all duration-300 ${
                    isActive
                      ? "bg-[#FFD700] text-black border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                      : "bg-white/5 text-gray-300 border-white/15 hover:text-white hover:border-[#FFD700]/40"
                  }`}
                >
                  {batch.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr,2fr] gap-6">
          <div className="bg-black/50 border border-white/10 rounded-2xl p-6">
            <p className="text-[#FFD700] font-cinzel tracking-[0.2em] uppercase text-xs mb-2">Active Batch</p>
            <h2 className="text-2xl md:text-3xl font-cinzel mb-2">{activeBatch.label}</h2>
            <p className="text-sm text-gray-400 mb-5">{activeBatch.yearRange}</p>
            <div className="border-t border-white/10 pt-4">
              <p className="text-[#FFD700] text-xs uppercase tracking-[0.2em] mb-3">Batch Photos</p>
              <button
                onClick={() => setShowBatchGallery(true)}
                className="group w-full rounded-xl border border-[#FFD700]/30 bg-black/40 overflow-hidden hover:border-[#FFD700]/70 transition-all duration-300"
              >
                <div className="relative h-[240px]">
                  {activePhotos.length > 0 ? (
                    <img
                      key={`${activeBatch.id}-${safeSlideIndex}`}
                      src={activePhotos[safeSlideIndex]}
                      alt={`${activeBatch.label} slideshow`}
                      className="w-full h-full object-cover animate-[fadein_500ms_ease]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No batch photos yet
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <p className="absolute bottom-3 left-3 text-[11px] uppercase tracking-[0.2em] text-[#FFD700]">
                    Click to view all
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-black/55 border border-white/10 rounded-2xl p-6">
            <p className="text-[#FFD700] text-xs uppercase tracking-[0.24em] mb-4">Group Members</p>
            <div className="rounded-2xl border border-[#FFD700]/20 bg-black/35 min-h-[320px] md:min-h-[360px] p-5">
              {activeGovernorNames.length > 0 && (
                <p className="mb-4 text-[11px] uppercase tracking-[0.2em] text-[#f3d47a]">
                  Gold-highlighted names are the batch leads.
                </p>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(activeBatch.members || [])
                  .map((member) => String(member || "").trim())
                  .filter(Boolean)
                  .map((member, memberIndex) => {
                    const isGovernor = activeGovernorNames.some((governorName) => namesMatch(member, governorName));
                    return (
                      <div
                        key={`${member}-${memberIndex}`}
                        className={`rounded-xl border px-4 py-3 text-gray-200 transition-all duration-300 ${
                          isGovernor
                            ? "border-[#FFD700]/55 bg-[#FFD700]/12 text-[#fff2bf] shadow-[0_0_18px_rgba(255,215,0,0.1)]"
                            : "border-white/10 bg-white/5 hover:border-[#FFD700]/35 hover:bg-[#FFD700]/5"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {isGovernor && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.6)]" />}
                          <span>{member}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {showBatchGallery && (
        <div
          className="fixed inset-0 z-[9999999] bg-black/85 backdrop-blur-sm p-4 md:p-8"
          onClick={(event) => {
            if (event.target === event.currentTarget) setShowBatchGallery(false);
          }}
        >
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#FFD700] text-lg md:text-2xl font-cinzel tracking-[0.14em] uppercase">
                {activeBatch.label} - Photos
              </h3>
              <button
                onClick={() => setShowBatchGallery(false)}
                className="px-4 py-2 border border-[#FFD700]/40 rounded-md text-[#FFD700] text-xs uppercase tracking-[0.18em] hover:bg-[#FFD700] hover:text-black transition-all duration-300"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto pr-1">
              {activePhotos.map((src, idx) => (
                <button
                  key={`${activeBatch.id}-photo-${idx}`}
                  type="button"
                  onClick={() => setSelectedBatchPhoto(src)}
                  className="group rounded-xl overflow-hidden border border-white/10 bg-black/40 text-left transition-all duration-300 hover:border-[#FFD700]/50 hover:shadow-[0_0_20px_rgba(255,215,0,0.12)] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/70"
                >
                  <div className="relative">
                    <img
                      src={src}
                      alt={`${activeBatch.label} ${idx + 1}`}
                      className="w-full h-[220px] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showBatchGallery && selectedBatchPhoto && (
        <div
          className="fixed inset-0 z-[10000000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedBatchPhoto(null);
          }}
        >
          <div className="relative max-w-6xl w-full max-h-[90vh]">
            <button
              type="button"
              onClick={() => setSelectedBatchPhoto(null)}
              className="absolute -top-12 right-0 text-[#FFD700] text-sm uppercase tracking-[0.22em] border border-[#FFD700]/35 bg-black/70 rounded-md px-4 py-2 hover:bg-[#FFD700] hover:text-black transition-all duration-300"
            >
              Close
            </button>
            <img
              src={selectedBatchPhoto}
              alt={`${activeBatch.label} preview`}
              className="max-h-[90vh] w-auto max-w-full mx-auto object-contain rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.65)]"
            />
          </div>
        </div>
      )}

      <style>{`@keyframes fadein{from{opacity:.45;transform:scale(1.02)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}
