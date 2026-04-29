import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createDefaultSiteContent } from "../data/defaultSiteContent";
import { resolveMediaUrl } from "../utils/media";
import {
  fetchAdminSiteContent,
  refreshPublicSiteSnapshot,
  updateAdminSiteContent,
  uploadAdminImage,
} from "../services/service";
import { mergeSiteContent, writeCachedSiteContent } from "../utils/siteContent";

const deepClone = (value) => JSON.parse(JSON.stringify(value));
const arrayToLines = (items) => (Array.isArray(items) ? items.join("\n") : "");
const linesToArray = (value) =>
  String(value || "")
    .split("\n");
const isUnauthorizedError = (error) => Number(error?.status) === 401;
const isNetworkError = (error) =>
  Number(error?.status) === 0 || /failed to fetch|networkerror/i.test(String(error?.message || ""));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const CAST_START_YEAR = 2010;
const SAVE_BUTTON_STICKY_TOP = 88;
const buildCastYearOptions = (startYear, endYear) => {
  const safeStart = Number(startYear) || CAST_START_YEAR;
  const safeEnd = Number(endYear) || new Date().getFullYear();
  const years = [];
  for (let year = safeEnd; year >= safeStart; year -= 1) {
    years.push(String(year));
  }
  return years;
};
const createCastBatchFromYear = (yearValue) => {
  const year = String(yearValue || "").trim();
  const yearNum = Number(year);
  const nextYear = Number.isFinite(yearNum) ? yearNum + 4 : "";
  return {
    id: year,
    label: year ? `Batch of ${year}` : "",
    yearRange: year ? `${year} - ${nextYear}` : "",
    members: [],
    photos: [],
  };
};
const createNavarasaItem = (idValue) => {
  const id = String(idValue || "").trim() || `rasa-${Date.now()}`;
  return {
    id,
    name: id,
    subtitle: "",
    plays: [],
  };
};

const TICKET_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1orVQ0AxpButerxWqD_vwcWtaIBPTQ_EoTWUGM5e85EA/edit?usp=sharing";

export default function AdminPanel() {
  const profile = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("admin_profile") || "{}");
    } catch {
      return {};
    }
  }, []);

  const token = localStorage.getItem("admin_token");

  const [content, setContent] = useState(createDefaultSiteContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pinSaveButton, setPinSaveButton] = useState(false);
  const saveButtonAnchorRef = useRef(null);
  const navarasasListRef = useRef(null);
  const [selectedNavarasaId, setSelectedNavarasaId] = useState("shringara");
  const selectedNavarasaIdRef = useRef(selectedNavarasaId);
  const [newPlayName, setNewPlayName] = useState("");
  const defaultCastYear = String(new Date().getFullYear());
  const [selectedCastYear, setSelectedCastYear] = useState(defaultCastYear);
  const castYearOptions = useMemo(
    () => buildCastYearOptions(CAST_START_YEAR, Number(defaultCastYear)),
    [defaultCastYear]
  );
  const navItems = [
    { label: "Latest Event", href: "#admin-latest-event" },
    { label: "The Script", href: "#admin-script" },
    { label: "Gallery", href: "/admin/gallery" },
    { label: "Navarasas", href: "#admin-navarasas" },
    { label: "Cast", href: "#admin-cast" },
    { label: "Tickets", href: "#admin-tickets" },
    { label: "Governors", href: "#admin-governors" },
  ];
  const selectedCastBatch = useMemo(() => {
    const found = (content.castBatches || []).find((batch) => String(batch.id) === String(selectedCastYear));
    const batch = found || createCastBatchFromYear(selectedCastYear);
    return {
      ...batch,
      members: Array.isArray(batch.members) ? batch.members : [],
      photos: Array.isArray(batch.photos) ? batch.photos : [],
    };
  }, [content.castBatches, selectedCastYear]);
  const selectedNavarasa = useMemo(() => {
    const found = (content.navarasas || []).find((rasa) => String(rasa.id) === String(selectedNavarasaId));
    const rasa = found || createNavarasaItem(selectedNavarasaId);
    return {
      ...rasa,
      plays: Array.isArray(rasa.plays) ? rasa.plays : [],
    };
  }, [content.navarasas, selectedNavarasaId]);
  const selectedNavarasaIndex = useMemo(
    () => (content.navarasas || []).findIndex((rasa) => String(rasa.id) === String(selectedNavarasaId)),
    [content.navarasas, selectedNavarasaId]
  );

  useEffect(() => {
    selectedNavarasaIdRef.current = selectedNavarasaId;
  }, [selectedNavarasaId]);

  useEffect(() => {
    const list = navarasasListRef.current;
    const selectedButton = list?.children?.[selectedNavarasaIndex];
    if (selectedButton && typeof selectedButton.scrollIntoView === "function") {
      selectedButton.scrollIntoView({ block: "nearest" });
    }
  }, [selectedNavarasaIndex]);

  const logout = useCallback((redirectPath = "/") => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_profile");
    window.location.href = redirectPath;
  }, []);

  const loadContent = useCallback(
    async ({ silent = false } = {}) => {
      const maxAttempts = 3;
      if (!silent) {
        setLoading(true);
      }
      setError("");
      try {
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
          try {
            const data = await fetchAdminSiteContent(token);
            const mergedContent = mergeSiteContent(data);
            const incomingNavarasas = Array.isArray(mergedContent.navarasas) ? mergedContent.navarasas : [];
            const incomingCastBatches = Array.isArray(mergedContent.castBatches) ? mergedContent.castBatches : [];
            const preferredYear =
              incomingCastBatches
                .map((batch) => String(batch?.id || ""))
                .filter((year) => /^\d{4}$/.test(year))
                .sort((a, b) => Number(b) - Number(a))[0] || defaultCastYear;
            const preferredRasaId = incomingNavarasas.some(
              (rasa) => String(rasa.id) === String(selectedNavarasaIdRef.current)
            )
              ? String(selectedNavarasaIdRef.current)
              : String(incomingNavarasas[0]?.id || "shringara");
            setContent(mergedContent);
            setSelectedCastYear(preferredYear);
            setSelectedNavarasaId(preferredRasaId);
            return;
          } catch (err) {
            if (isUnauthorizedError(err)) {
              logout("/admin-login");
              return;
            }
            const canRetry = attempt < maxAttempts && isNetworkError(err);
            if (!canRetry) throw err;
            await wait(500 * attempt);
          }
        }
      } catch (err) {
        const fallbackMessage = "Failed to load content.";
        const networkMessage =
          "Cannot reach backend on http://localhost:5000. Start backend server and click Refresh.";
        setError(isNetworkError(err) ? networkMessage : err?.message || fallbackMessage);
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [defaultCastYear, logout, token]
  );

  useEffect(() => {
    if (!token) {
      window.location.href = "/admin-login";
      return;
    }
    loadContent();
  }, [token, loadContent]);

  useEffect(() => {
    const updatePinnedSaveButton = () => {
      if (!saveButtonAnchorRef.current) return;
      const { top } = saveButtonAnchorRef.current.getBoundingClientRect();
      const nextPinned = top <= SAVE_BUTTON_STICKY_TOP;
      setPinSaveButton((prev) => (prev === nextPinned ? prev : nextPinned));
    };

    updatePinnedSaveButton();
    window.addEventListener("scroll", updatePinnedSaveButton, { passive: true });
    window.addEventListener("resize", updatePinnedSaveButton);
    return () => {
      window.removeEventListener("scroll", updatePinnedSaveButton);
      window.removeEventListener("resize", updatePinnedSaveButton);
    };
  }, []);

  const uploadImage = async (file) => {
    if (!file) return "";
    setUploading(true);
    setError("");
    try {
      const data = await uploadAdminImage(token, file);
      return data.fileUrl || "";
    } catch (err) {
      if (isUnauthorizedError(err)) {
        logout("/admin-login");
        return "";
      }
      setError(err?.message || "Upload failed.");
      return "";
    } finally {
      setUploading(false);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const galleryImages = Array.isArray(content.gallery?.images)
        ? content.gallery.images
        : [];
      const castBatches = Array.isArray(content.castBatches)
        ? content.castBatches
        : [];
      const timeline = Array.isArray(content.timeline) ? content.timeline : [];
      const navarasas = Array.isArray(content.navarasas) ? content.navarasas : [];
      const latestEvent = content.latestEvent || createDefaultSiteContent().latestEvent;
      const payload = {
        gallery: {
          images: Array.isArray(galleryImages) ? galleryImages : [],
        },
        castBatches: castBatches.map((batch) => ({
          ...batch,
          photos: Array.isArray(batch.photos) ? batch.photos : [],
        })),
        timeline,
        navarasas,
        governors: content.governors || [],
        latestEvent,
      };

      console.log("Sending payload:", payload);
      await updateAdminSiteContent(token, payload);
      writeCachedSiteContent(mergeSiteContent(payload));

      let savedMessage = "Content saved successfully.";
      try {
        const refreshResult = await refreshPublicSiteSnapshot();
        savedMessage = refreshResult.refreshed
          ? "Content saved successfully. Live snapshot refreshed."
          : "Content saved successfully. Live snapshot will refresh when the snapshot endpoint is available.";
      } catch {
        savedMessage = "Content saved successfully. Live snapshot will refresh when the snapshot endpoint is available.";
      }

      setMessage(savedMessage);
      await loadContent();
    } catch (err) {
      if (isUnauthorizedError(err)) {
        logout("/admin-login");
        return;
      }
      setError(err?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const updateTimelineItem = (index, field, value) => {
    setContent((prev) => {
      const next = deepClone(prev);
      next.timeline[index][field] = value;
      return next;
    });
  };

  const updateSelectedNavarasa = (field, value) => {
    setContent((prev) => {
      const next = deepClone(prev);
      next.navarasas = Array.isArray(next.navarasas) ? next.navarasas : [];
      const currentId = String(selectedNavarasaId || "");
      let index = next.navarasas.findIndex((rasa) => String(rasa.id) === currentId);
      if (index < 0) {
        next.navarasas.push(createNavarasaItem(currentId));
        index = next.navarasas.length - 1;
      }
      next.navarasas[index][field] = value;
      return next;
    });
    if (field === "id") {
      const nextId = String(value || "").trim();
      if (nextId) setSelectedNavarasaId(nextId);
    }
  };

  const addPlayToSelectedNavarasa = () => {
    const playName = String(newPlayName || "").trim();
    if (!playName) return;
    updateSelectedNavarasa("plays", [...(selectedNavarasa.plays || []), playName]);
    setNewPlayName("");
  };

  const updateSelectedPlay = (playIndex, value) => {
    const nextPlays = [...(selectedNavarasa.plays || [])];
    nextPlays[playIndex] = value;
    updateSelectedNavarasa("plays", nextPlays);
  };

  const removeSelectedPlay = (playIndex) => {
    const nextPlays = (selectedNavarasa.plays || []).filter((_, index) => index !== playIndex);
    updateSelectedNavarasa("plays", nextPlays);
  };

  const updateSelectedCastBatch = (field, value) => {
    setContent((prev) => {
      const next = deepClone(prev);
      next.castBatches = Array.isArray(next.castBatches) ? next.castBatches : [];
      const currentYear = String(selectedCastYear || "");
      let index = next.castBatches.findIndex((batch) => String(batch.id) === currentYear);
      if (index < 0) {
        next.castBatches.push(createCastBatchFromYear(currentYear));
        index = next.castBatches.length - 1;
      }
      next.castBatches[index][field] = value;
      return next;
    });
  };

  const updateGovernor = (index, field, value) => {
    setContent((prev) => {
      const next = deepClone(prev);
      next.governors[index][field] = value;
      return next;
    });
  };

  const updateLatestEvent = (field, value) => {
    setContent((prev) => ({
      ...prev,
      latestEvent: {
        ...(prev.latestEvent || createDefaultSiteContent().latestEvent),
        [field]: value,
      },
    }));
  };

  if (loading) {
    if (!token) return null;
    return (
      <div className="admin-panel-root min-h-screen bg-[#050d24] text-[#FFD700] flex items-center justify-center">
        <p className="font-cinzel tracking-[0.2em] uppercase">Loading Backstage Control Room...</p>
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="admin-panel-root min-h-screen bg-[#050d24] text-white px-4 md:px-8 py-8">
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 rounded-full border border-[#FFD700]/30 bg-[linear-gradient(90deg,rgba(55,8,8,0.55),rgba(6,8,18,0.88))] backdrop-blur-xl px-3 md:px-5 py-2.5 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between gap-3">
          <a href="#top" className="hidden md:flex items-center gap-3 min-w-[210px]">
            <span className="h-9 w-9 rounded-full border border-[#FFD700]/40 flex items-center justify-center text-[#FFD700] font-cinzel">
              P
            </span>
            <span>
              <span className="block text-[10px] uppercase tracking-[0.3em] text-[#d7b28d] leading-none">
                Telugu Dramatics
              </span>
              <span className="block text-[#FFD700] font-cinzel tracking-[0.16em] text-sm mt-1">Prasthanam</span>
            </span>
          </a>
          <div className="flex items-center gap-1 md:gap-2 overflow-x-auto">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="shrink-0 px-3 md:px-4 py-2 text-[11px] md:text-xs uppercase tracking-[0.2em] text-gray-200 rounded-full border border-transparent hover:border-[#FFD700]/35 hover:text-[#FFD700] transition-all"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/?skipCurtain=1"
              className="px-3 md:px-5 py-2 rounded-full border border-[#FFD700]/45 text-[#FFD700] text-[11px] md:text-xs uppercase tracking-[0.2em] hover:bg-[#FFD700] hover:text-black transition-all"
            >
              Stage
            </a>
            <button
              onClick={logout}
              className="px-3 md:px-5 py-2 rounded-full border border-white/20 text-gray-200 text-[11px] md:text-xs uppercase tracking-[0.2em] hover:border-[#FFD700]/35 hover:text-[#FFD700] transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div id="top" className="max-w-7xl mx-auto space-y-6 pt-24">
        <div className="rounded-3xl border border-[#FFD700]/40 bg-black/45 p-6 shadow-[0_0_45px_rgba(255,215,0,0.1)]">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#e2c4a4] mb-1">Backstage Control Room</p>
              <h1 className="text-3xl md:text-4xl font-cinzel text-[#FFD700] uppercase tracking-[0.12em]">
                Admin Panel
              </h1>
              <p className="text-gray-300 mt-2 text-sm">
                Logged in as:{" "}
                <span className="text-[#FFD700]">{profile.displayName || profile.username || "Admin"}</span>
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={loadContent}
                className="px-4 py-2 rounded-md border border-[#FFD700]/35 text-[#FFD700] uppercase tracking-[0.14em] text-xs hover:bg-[#FFD700] hover:text-black transition-all"
              >
                Refresh
              </button>
              <div ref={saveButtonAnchorRef} className="min-w-[230px]">
                <button
                  onClick={saveContent}
                  disabled={saving}
                  className={`inline-flex items-center justify-center min-w-[230px] px-5 py-2 rounded-md border border-[#d81e1e] bg-gradient-to-r from-[#7f0000] to-[#d91414] text-[#ffe9e9] uppercase tracking-[0.14em] text-xs hover:shadow-[0_0_18px_rgba(217,20,20,0.6)] disabled:opacity-60 transition-all ${
                    pinSaveButton ? "fixed top-[88px] right-4 md:right-8 z-[70]" : ""
                  }`}
                >
                  {saving ? "Saving..." : "Save All Changes"}
                </button>
              </div>
            </div>
          </div>
          {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
          {message && <p className="text-emerald-400 mt-4 text-sm">{message}</p>}
        </div>

        <section id="admin-latest-event" className="rounded-2xl border border-[#FFD700]/25 bg-black/35 p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-cinzel text-[#FFD700] tracking-[0.1em] uppercase">Latest Event Poster</h2>
            <label className="px-4 py-2 rounded-md border border-[#FFD700]/35 text-[#FFD700] text-xs uppercase tracking-[0.14em] cursor-pointer hover:bg-[#FFD700] hover:text-black transition-all">
              {uploading ? "Uploading..." : "Upload Poster"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  const url = await uploadImage(file);
                  if (url) updateLatestEvent("poster", url);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
          <div className="grid lg:grid-cols-[300px,1fr] gap-4">
            <div className="border border-white/10 rounded-lg p-3 bg-black/30">
              <div className="aspect-[1/1.414] rounded-md overflow-hidden border border-[#FFD700]/25 bg-black/60">
                {content.latestEvent?.poster ? (
                  <img
                    src={resolveMediaUrl(content.latestEvent.poster)}
                    alt="Latest event poster"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs uppercase tracking-[0.14em] text-gray-400">
                    No poster uploaded
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3 border border-white/10 rounded-lg p-4 bg-black/30">
              <input
                value={content.latestEvent?.title || ""}
                onChange={(event) => updateLatestEvent("title", event.target.value)}
                placeholder="Production / Event title"
                className="w-full px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
              />
              <div className="grid md:grid-cols-3 gap-2">
                <input
                  value={content.latestEvent?.date || ""}
                  onChange={(event) => updateLatestEvent("date", event.target.value)}
                  placeholder="Date"
                  className="px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
                />
                <input
                  value={content.latestEvent?.time || ""}
                  onChange={(event) => updateLatestEvent("time", event.target.value)}
                  placeholder="Time"
                  className="px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
                />
                <input
                  value={content.latestEvent?.venue || ""}
                  onChange={(event) => updateLatestEvent("venue", event.target.value)}
                  placeholder="Venue"
                  className="px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
                />
              </div>
              <textarea
                value={content.latestEvent?.description || ""}
                onChange={(event) => updateLatestEvent("description", event.target.value)}
                placeholder="Short event description"
                rows={4}
                className="w-full px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none resize-y"
              />
            </div>
          </div>
        </section>

        <section id="admin-script" className="rounded-2xl border border-[#FFD700]/25 bg-black/35 p-5">
          <a
            href="/admin/gallery"
            className="group mb-5 block w-full rounded-2xl border border-[#FFD700]/35 bg-black/45 px-6 py-8 text-center shadow-[0_0_30px_rgba(255,215,0,0.12)] transition-all duration-300 hover:border-[#FFD700] hover:bg-[#FFD700]/10 hover:shadow-[0_0_55px_rgba(255,215,0,0.22)]"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-[#e2c4a4] mb-3">Media Archive</p>
            <h3 className="font-cinzel text-3xl md:text-4xl tracking-[0.16em] uppercase text-[#FFD700] group-hover:tracking-[0.2em] transition-all">
              Theesukunna photo-lu
            </h3>
            <p className="text-gray-300 text-sm mt-3">View all existing photos and upload new images.</p>
          </a>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-cinzel text-[#FFD700] tracking-[0.1em] uppercase">Script History (Mana baagothaalu)</h2>
            <button
              onClick={() =>
                setContent((prev) => ({
                  ...prev,
                  timeline: [
                    ...(prev.timeline || []),
                    { year: String(new Date().getFullYear()), title: "New Card", desc: "Add description..." },
                  ],
                }))
              }
              className="px-4 py-2 rounded-md border border-[#FFD700]/35 text-[#FFD700] text-sm hover:bg-[#FFD700] hover:text-black transition-all"
            >
              Add Card
            </button>
          </div>
          <div className="space-y-3">
            {(content.timeline || []).map((item, index) => (
              <div key={`timeline-${index}`} className="grid md:grid-cols-[120px,1fr,1.5fr,90px] gap-3 items-start border border-white/10 rounded-lg p-3 bg-black/30">
                <input
                  value={item.year}
                  onChange={(event) => updateTimelineItem(index, "year", event.target.value)}
                  placeholder="Year"
                  className="px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
                />
                <input
                  value={item.title}
                  onChange={(event) => updateTimelineItem(index, "title", event.target.value)}
                  placeholder="Event title"
                  className="px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
                />
                <textarea
                  value={item.desc}
                  onChange={(event) => updateTimelineItem(index, "desc", event.target.value)}
                  placeholder="Description"
                  rows={2}
                  className="px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none resize-y"
                />
                <button
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      timeline: (prev.timeline || []).filter((_, i) => i !== index),
                    }))
                  }
                  className="px-3 py-2 rounded border border-red-400 text-red-300 text-sm hover:bg-red-500/20"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>

        <section id="admin-navarasas" className="rounded-2xl border border-[#FFD700]/25 bg-black/35 p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-cinzel text-[#FFD700] tracking-[0.1em] uppercase">Navarasa, Mana Kalakandaalu</h2>
            <button
              onClick={() => {
                const newId = `rasa-${Date.now()}`;
                setContent((prev) => ({
                  ...prev,
                  navarasas: [...(prev.navarasas || []), createNavarasaItem(newId)],
                }));
                setSelectedNavarasaId(newId);
              }}
              className="px-4 py-2 rounded-md border border-[#FFD700]/35 text-[#FFD700] text-sm hover:bg-[#FFD700] hover:text-black transition-all"
            >
              Add Rasa
            </button>
          </div>
          <div className="grid lg:grid-cols-[280px,1fr] gap-4">
            <div
              ref={navarasasListRef}
              className="border border-white/10 rounded-lg p-3 bg-black/30 space-y-2 max-h-[420px] overflow-auto"
            >
              {(content.navarasas || []).map((rasa) => {
                const isActive = String(rasa.id) === String(selectedNavarasaId);
                return (
                  <button
                    key={rasa.id}
                    onClick={() => setSelectedNavarasaId(String(rasa.id))}
                    className={`w-full text-left px-3 py-2 rounded-md border transition-all ${
                      isActive
                        ? "border-[#FFD700]/65 bg-[#FFD700]/10 text-[#FFD700]"
                        : "border-white/10 bg-black/40 text-gray-200 hover:border-[#FFD700]/40 hover:text-[#FFD700]"
                    }`}
                  >
                    <p className="text-sm uppercase tracking-[0.14em]">{rasa.name || rasa.id}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{rasa.id}</p>
                  </button>
                );
              })}
            </div>

            <div className="border border-white/10 rounded-lg p-4 bg-black/30 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={selectedNavarasa.id}
                  onChange={(event) => updateSelectedNavarasa("id", event.target.value)}
                  placeholder="id (shringara)"
                  className="px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
                />
                <input
                  value={selectedNavarasa.name}
                  onChange={(event) => updateSelectedNavarasa("name", event.target.value)}
                  placeholder="Name"
                  className="px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
                />
              </div>
              <input
                value={selectedNavarasa.subtitle}
                onChange={(event) => updateSelectedNavarasa("subtitle", event.target.value)}
                placeholder="Subtitle"
                className="w-full px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
              />
              <div className="rounded-lg border border-white/10 p-3 bg-black/40 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    value={newPlayName}
                    onChange={(event) => setNewPlayName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addPlayToSelectedNavarasa();
                      }
                    }}
                    placeholder="Add play name"
                    className="flex-1 px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
                  />
                  <button
                    onClick={addPlayToSelectedNavarasa}
                    className="px-4 py-2 rounded border border-[#FFD700]/35 text-[#FFD700] text-xs uppercase tracking-[0.14em] hover:bg-[#FFD700] hover:text-black transition-all"
                  >
                    Add Play
                  </button>
                </div>
                <div className="space-y-2 max-h-[220px] overflow-auto pr-1">
                  {(selectedNavarasa.plays || []).map((play, playIndex) => (
                    <div key={`${selectedNavarasa.id}-play-${playIndex}`} className="flex items-center gap-2">
                      <input
                        value={play}
                        onChange={(event) => updateSelectedPlay(playIndex, event.target.value)}
                        className="flex-1 px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
                      />
                      <button
                        onClick={() => removeSelectedPlay(playIndex)}
                        className="px-3 py-2 rounded border border-red-400 text-red-300 text-xs uppercase tracking-[0.12em] hover:bg-red-500/20"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  const remaining = (content.navarasas || []).filter(
                    (rasa) => String(rasa.id) !== String(selectedNavarasaId)
                  );
                  setContent((prev) => ({
                    ...prev,
                    navarasas: remaining,
                  }));
                  setSelectedNavarasaId(String(remaining[0]?.id || "shringara"));
                }}
                className="px-3 py-2 rounded border border-red-400 text-red-300 text-sm hover:bg-red-500/20"
              >
                Delete Selected Rasa
              </button>
            </div>
          </div>
        </section>

        <section id="admin-cast" className="rounded-2xl border border-[#FFD700]/25 bg-black/35 p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-cinzel text-[#FFD700] tracking-[0.1em] uppercase leading-snug">
              <span className="block">Cast</span>
              <span className="block">Mana vaale</span>
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={selectedCastYear}
                onChange={(event) => setSelectedCastYear(event.target.value)}
                className="px-4 py-2 rounded-md bg-black/60 border border-[#FFD700]/35 text-[#FFD700] text-sm focus:border-[#FFD700] outline-none"
              >
                {castYearOptions.map((year) => (
                  <option key={year} value={year}>
                    Batch of {year}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const year = String(window.prompt("Enter batch year (e.g. 2026):") || "").trim();
                  if (!/^\d{4}$/.test(year)) return;
                  setContent((prev) => {
                    const next = deepClone(prev);
                    next.castBatches = Array.isArray(next.castBatches) ? next.castBatches : [];
                    const exists = next.castBatches.some((batch) => String(batch.id) === year);
                    if (!exists) {
                      next.castBatches.push(createCastBatchFromYear(year));
                    }
                    return next;
                  });
                  setSelectedCastYear(year);
                }}
                className="px-4 py-2 rounded-md border border-[#FFD700]/35 text-[#FFD700] text-sm hover:bg-[#FFD700] hover:text-black transition-all"
              >
                Add New Batch
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-[0.14em] mb-3">
            Batch year = joining year. Default range auto-follows as {selectedCastYear} - {Number(selectedCastYear) + 4}.
          </p>
          <div className="border border-white/10 rounded-lg p-4 bg-black/30 space-y-3">
            <div className="grid md:grid-cols-3 gap-2">
              <input
                value={selectedCastYear}
                readOnly
                className="px-3 py-2 rounded bg-black/50 border border-white/15 text-gray-300"
              />
              <input
                value={selectedCastBatch.label || `Batch of ${selectedCastYear}`}
                onChange={(event) => updateSelectedCastBatch("label", event.target.value)}
                placeholder={`Batch of ${selectedCastYear}`}
                className="px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
              />
              <input
                value={selectedCastBatch.yearRange || `${selectedCastYear} - ${Number(selectedCastYear) + 4}`}
                onChange={(event) => updateSelectedCastBatch("yearRange", event.target.value)}
                placeholder={`${selectedCastYear} - ${Number(selectedCastYear) + 4}`}
                className="px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
              />
            </div>
            <textarea
              value={arrayToLines(selectedCastBatch.members)}
              onChange={(event) => updateSelectedCastBatch("members", linesToArray(event.target.value))}
              placeholder="Members (one per line)"
              rows={4}
              className="w-full px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none resize-y"
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-[#FFD700] tracking-[0.12em] uppercase">Batch Photos</p>
                <label className="px-3 py-1.5 rounded border border-[#FFD700]/35 text-[#FFD700] text-xs cursor-pointer hover:bg-[#FFD700] hover:text-black transition-all">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      const url = await uploadImage(file);
                      if (url) {
                        setContent((prev) => {
                          const next = deepClone(prev);
                          next.castBatches = Array.isArray(next.castBatches) ? next.castBatches : [];
                          let index = next.castBatches.findIndex(
                            (batch) => String(batch.id) === String(selectedCastYear)
                          );
                          if (index < 0) {
                            next.castBatches.push(createCastBatchFromYear(selectedCastYear));
                            index = next.castBatches.length - 1;
                          }
                          next.castBatches[index].photos = [...(next.castBatches[index].photos || []), url];
                          return next;
                        });
                      }
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(selectedCastBatch.photos || []).map((photo, photoIndex) => (
                  <div key={`batch-${selectedCastYear}-photo-${photoIndex}`} className="relative border border-white/10 rounded overflow-hidden">
                    <img src={resolveMediaUrl(photo)} alt="" className="h-20 w-full object-cover" />
                    <button
                      onClick={() =>
                        setContent((prev) => {
                          const next = deepClone(prev);
                          next.castBatches = Array.isArray(next.castBatches) ? next.castBatches : [];
                          let index = next.castBatches.findIndex(
                            (batch) => String(batch.id) === String(selectedCastYear)
                          );
                          if (index < 0) return next;
                          next.castBatches[index].photos = (next.castBatches[index].photos || []).filter(
                            (_, i) => i !== photoIndex
                          );
                          return next;
                        })
                      }
                      className="absolute top-1 right-1 text-[11px] px-2 py-0.5 rounded bg-black/70 border border-red-400 text-red-300"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                const remaining = (content.castBatches || []).filter(
                  (batch) => String(batch.id) !== String(selectedCastYear)
                );
                setContent((prev) => ({
                  ...prev,
                  castBatches: remaining,
                }));
                const fallbackYear =
                  remaining
                    .map((batch) => String(batch?.id || ""))
                    .filter((year) => /^\d{4}$/.test(year))
                    .sort((a, b) => Number(b) - Number(a))[0] || castYearOptions[0];
                setSelectedCastYear(fallbackYear);
              }}
              className="px-3 py-2 rounded border border-red-400 text-red-300 text-sm hover:bg-red-500/20"
            >
              Delete Selected Batch
            </button>
          </div>
        </section>

        <section id="admin-governors" className="rounded-2xl border border-[#FFD700]/25 bg-black/35 p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-cinzel text-[#FFD700] tracking-[0.1em] uppercase">Governors</h2>
            <button
              onClick={() =>
                setContent((prev) => ({
                  ...prev,
                  governors: [
                    ...(prev.governors || []),
                    {
                      name: "",
                      role: "",
                      quote: "",
                      funFact: "",
                      department: "",
                      contactInfo: "",
                      zodiacSign: "",
                      img: "",
                    },
                  ],
                }))
              }
              className="px-4 py-2 rounded-md border border-[#FFD700]/35 text-[#FFD700] text-sm hover:bg-[#FFD700] hover:text-black transition-all"
            >
              Add Governor
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {(content.governors || []).map((governor, index) => (
              <div key={`gov-${index}`} className="border border-white/10 rounded-lg p-4 bg-black/30 space-y-2">
                <input
                  value={governor.name}
                  onChange={(event) => updateGovernor(index, "name", event.target.value)}
                  placeholder="Name"
                  className="w-full px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
                />
                <input
                  value={governor.role}
                  onChange={(event) => updateGovernor(index, "role", event.target.value)}
                  placeholder="Role"
                  className="w-full px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
                />
                <input
                  value={governor.quote}
                  onChange={(event) => updateGovernor(index, "quote", event.target.value)}
                  placeholder="Quote"
                  className="w-full px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
                />
                <input
                  value={governor.funFact}
                  onChange={(event) => updateGovernor(index, "funFact", event.target.value)}
                  placeholder="Fun fact"
                  className="w-full px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
                />
                <div className="grid md:grid-cols-2 gap-2">
                  <input
                    value={governor.department || ""}
                    onChange={(event) => updateGovernor(index, "department", event.target.value)}
                    placeholder="Department"
                    className="w-full px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
                  />
                  <input
                    value={governor.contactInfo || ""}
                    onChange={(event) => updateGovernor(index, "contactInfo", event.target.value)}
                    placeholder="Contact info"
                    className="w-full px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
                  />
                  <input
                    value={governor.zodiacSign || ""}
                    onChange={(event) => updateGovernor(index, "zodiacSign", event.target.value)}
                    placeholder="Zodiac sign (optional)"
                    className="w-full md:col-span-2 px-3 py-2 rounded bg-black/60 border border-white/15 focus:border-[#FFD700]/60 outline-none"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-1.5 rounded border border-[#FFD700]/35 text-[#FFD700] text-xs cursor-pointer hover:bg-[#FFD700] hover:text-black transition-all">
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        const url = await uploadImage(file);
                        if (url) updateGovernor(index, "img", url);
                        event.target.value = "";
                      }}
                    />
                  </label>
                  {governor.img && (
                    <img
                      src={resolveMediaUrl(governor.img)}
                      alt={governor.name}
                      className="w-12 h-12 object-cover rounded border border-white/20"
                    />
                  )}
                </div>
                <button
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      governors: (prev.governors || []).filter((_, i) => i !== index),
                    }))
                  }
                  className="px-3 py-2 rounded border border-red-400 text-red-300 text-sm hover:bg-red-500/20"
                >
                  Delete Governor
                </button>
              </div>
            ))}
          </div>
        </section>

        <section id="admin-tickets" className="rounded-2xl border border-[#FFD700]/25 bg-black/35 p-5">
          <h2 className="text-xl font-cinzel text-[#FFD700] tracking-[0.1em] uppercase mb-2">Tickets</h2>
          <div className="space-y-3 text-sm text-gray-300">
            <p>
              Public ticket form submissions now go through the backend booking API and append into the connected Google
              Sheet.
            </p>
            <a
              href={TICKET_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-md border border-[#FFD700]/35 text-[#FFD700] uppercase tracking-[0.14em] text-xs hover:bg-[#FFD700] hover:text-black transition-all"
            >
              Open Ticket Sheet
            </a>
            <p className="text-xs text-gray-400">
              Backend activation needs `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` in
              `backend/.env`, and the sheet must be shared with that service account.
            </p>
          </div>
        </section>

        <p className="text-center text-gray-400/80 text-sm pb-2">
          Idantha chusukodame manam antha chesukunna karma
        </p>
      </div>
      <style>{`
        .admin-panel-root, .admin-panel-root * {
          cursor: auto !important;
          font-family: "Gamja Flower", cursive !important;
        }
        .admin-panel-root {
          scroll-behavior: smooth;
        }
        .admin-panel-root h1,
        .admin-panel-root h2,
        .admin-panel-root h3,
        .admin-panel-root h4,
        .admin-panel-root h5,
        .admin-panel-root h6 {
          font-family: "Rock 3D", system-ui !important;
          letter-spacing: 0.08em;
        }
        .admin-panel-root :not(h1):not(h2):not(h3):not(h4):not(h5):not(h6).text-[10px] {
          font-size: 12px !important;
        }
        .admin-panel-root :not(h1):not(h2):not(h3):not(h4):not(h5):not(h6).text-[11px] {
          font-size: 13px !important;
        }
        .admin-panel-root :not(h1):not(h2):not(h3):not(h4):not(h5):not(h6).text-xs {
          font-size: calc(0.75rem + 2px) !important;
        }
        .admin-panel-root :not(h1):not(h2):not(h3):not(h4):not(h5):not(h6).text-sm {
          font-size: calc(0.875rem + 2px) !important;
        }
        .admin-panel-root :not(h1):not(h2):not(h3):not(h4):not(h5):not(h6).text-base {
          font-size: calc(1rem + 2px) !important;
        }
        .admin-panel-root :not(h1):not(h2):not(h3):not(h4):not(h5):not(h6).text-lg {
          font-size: calc(1.125rem + 2px) !important;
        }
        .admin-panel-root input,
        .admin-panel-root textarea,
        .admin-panel-root select,
        .admin-panel-root button,
        .admin-panel-root a,
        .admin-panel-root p,
        .admin-panel-root label {
          font-size: calc(1rem + 2px);
        }
        .admin-panel-root input, .admin-panel-root textarea {
          caret-color: #FFD700;
        }
      `}</style>
    </div>
  );
}
