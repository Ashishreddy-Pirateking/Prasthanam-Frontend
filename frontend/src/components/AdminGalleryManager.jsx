import { useCallback, useEffect, useMemo, useState } from "react";
import { createDefaultSiteContent } from "../data/defaultSiteContent";
import { refreshPublicSiteSnapshot, uploadAdminImage } from "../services/service";
import { getApiBase, resolveMediaUrl } from "../utils/media";
import { mergeSiteContent, writeCachedSiteContent } from "../utils/siteContent";

const API_BASE = getApiBase();

const parseApiResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return response.json();
  const text = await response.text();
  return { message: text || "Unexpected server response." };
};

const extractUploadTimestamp = (value) => {
  const source = String(value || "");
  const match = source.match(/\/uploads\/(\d+)-/);
  return match ? Number(match[1]) : null;
};

const sortGalleryEntries = (items) =>
  (items || [])
    .map((value, originalIndex) => ({
      value,
      originalIndex,
      uploadTs: extractUploadTimestamp(value),
    }))
    .sort((a, b) => {
      if (a.uploadTs && b.uploadTs) return b.uploadTs - a.uploadTs;
      if (a.uploadTs && !b.uploadTs) return -1;
      if (!a.uploadTs && b.uploadTs) return 1;
      const textA = String(a.value || "").toLowerCase();
      const textB = String(b.value || "").toLowerCase();
      if (textA < textB) return -1;
      if (textA > textB) return 1;
      return a.originalIndex - b.originalIndex;
    });

export default function AdminGalleryManager() {
  const token = localStorage.getItem("admin_token");
  const profile = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("admin_profile") || "{}");
    } catch {
      return {};
    }
  }, []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [content, setContent] = useState(createDefaultSiteContent);

  const navItems = [
    { label: "The Script", href: "/admin#admin-script" },
    { label: "Gallery", href: "/admin/gallery", active: true },
    { label: "Navarasas", href: "/admin#admin-navarasas" },
    { label: "Cast", href: "/admin#admin-cast" },
    { label: "Tickets", href: "/admin#admin-tickets" },
    { label: "Governors", href: "/admin#admin-governors" },
  ];

  const sortedGallery = useMemo(
    () => sortGalleryEntries(content.gallery?.images || []),
    [content.gallery?.images]
  );

  const logout = useCallback((redirectPath = "/") => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_profile");
    window.location.href = redirectPath;
  }, []);

  const handleUnauthorized = useCallback(async (response) => {
    if (response.status !== 401) return false;
    logout("/admin-login");
    return true;
  }, [logout]);

  const loadContent = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/content/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (await handleUnauthorized(response)) return;
      const data = await parseApiResponse(response);
      if (!response.ok) throw new Error(data.message || "Failed to load gallery content.");
      setContent(mergeSiteContent(data));
    } catch (err) {
      setError(err?.message || "Failed to load gallery content.");
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized, token]);

  useEffect(() => {
    if (!token) {
      window.location.href = "/admin-login";
      return;
    }
    loadContent();
  }, [loadContent, token]);

  const uploadImage = useCallback(
    async (file) => {
      if (!file) return "";
      try {
        const data = await uploadAdminImage(token, file);
        return data.fileUrl || "";
      } catch (err) {
        if (Number(err?.status) === 401) {
          logout("/admin-login");
        }
        throw err;
      }
    },
    [logout, token]
  );

  const uploadImages = useCallback(
    async (files) => {
      const pickedFiles = Array.isArray(files) ? files.filter(Boolean) : [];
      if (!pickedFiles.length) return;

      setUploading(true);
      setError("");
      setMessage("");

      const uploadedUrls = [];
      const failedFiles = [];

      try {
        for (let index = 0; index < pickedFiles.length; index += 1) {
          const file = pickedFiles[index];
          try {
            const url = await uploadImage(file);
            if (url) {
              uploadedUrls.push(url);
              setContent((prev) => ({
                ...prev,
                gallery: {
                  ...(prev.gallery || {}),
                  images: [...(prev.gallery?.images || []), url],
                },
              }));
            }
          } catch (err) {
            if (Number(err?.status) === 401) {
              return;
            }
            failedFiles.push({
              name: file?.name || `File ${index + 1}`,
              message: err?.message || "Upload failed.",
            });
          }
        }

        if (uploadedUrls.length) {
          setMessage(
            `Uploaded ${uploadedUrls.length} image${uploadedUrls.length === 1 ? "" : "s"} successfully.`
          );
        }

        if (failedFiles.length) {
          const failureSummary = failedFiles
            .slice(0, 3)
            .map((item) => `${item.name}: ${item.message}`)
            .join(" | ");
          setError(
            `Skipped ${failedFiles.length} image${failedFiles.length === 1 ? "" : "s"}. ${failureSummary}`
          );
        }
      } finally {
        setUploading(false);
      }
    },
    [uploadImage]
  );

  const saveGallery = async () => {
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
      const response = await fetch(
        `${API_BASE}/api/content/admin`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (await handleUnauthorized(response)) return;
      const data = await parseApiResponse(response);
      if (!response.ok) throw new Error(data.message || "Failed to save gallery.");
      writeCachedSiteContent(mergeSiteContent(payload));

      let savedMessage = "Gallery saved successfully.";
      try {
        const refreshResult = await refreshPublicSiteSnapshot();
        savedMessage = refreshResult.refreshed
          ? "Gallery saved successfully. Live snapshot refreshed."
          : "Gallery saved successfully. Live snapshot will refresh when the snapshot endpoint is available.";
      } catch {
        savedMessage = "Gallery saved successfully. Live snapshot will refresh when the snapshot endpoint is available.";
      }

      setMessage(savedMessage);
      await loadContent();
    } catch (err) {
      setError(err?.message || "Failed to save gallery.");
    } finally {
      setSaving(false);
    }
  };

  if (!token) return null;

  return (
    <div className="admin-panel-root min-h-screen bg-[#050d24] text-white px-4 md:px-8 py-8">
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 rounded-full border border-[#FFD700]/30 bg-[linear-gradient(90deg,rgba(55,8,8,0.55),rgba(6,8,18,0.88))] backdrop-blur-xl px-3 md:px-5 py-2.5 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between gap-3">
          <a href="/admin" className="hidden md:flex items-center gap-3 min-w-[210px]">
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
                className={`shrink-0 px-3 md:px-4 py-2 text-[11px] md:text-xs uppercase tracking-[0.2em] rounded-full border transition-all ${
                  item.active
                    ? "border-[#FFD700]/55 text-[#FFD700] bg-[#FFD700]/10"
                    : "border-transparent text-gray-200 hover:border-[#FFD700]/35 hover:text-[#FFD700]"
                }`}
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

      <div className="max-w-7xl mx-auto pt-24 space-y-6">
        <div className="rounded-3xl border border-[#FFD700]/40 bg-black/45 p-6 shadow-[0_0_45px_rgba(255,215,0,0.1)]">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#e2c4a4] mb-1">Backstage Gallery</p>
              <h1 className="text-3xl md:text-4xl font-cinzel text-[#FFD700] uppercase tracking-[0.12em]">
                Theesukunna photo-lu
              </h1>
              <p className="text-gray-300 mt-2 text-sm">
                Logged in as: <span className="text-[#FFD700]">{profile.displayName || profile.username || "Admin"}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/admin"
                className="px-4 py-2 rounded-md border border-[#FFD700]/35 text-[#FFD700] uppercase tracking-[0.14em] text-xs hover:bg-[#FFD700] hover:text-black transition-all"
              >
                Venaki po
              </a>
              <button
                onClick={loadContent}
                className="px-4 py-2 rounded-md border border-[#FFD700]/35 text-[#FFD700] uppercase tracking-[0.14em] text-xs hover:bg-[#FFD700] hover:text-black transition-all"
              >
                Refresh
              </button>
              <button
                onClick={saveGallery}
                disabled={saving}
                className="px-5 py-2 rounded-md border border-[#d81e1e] bg-gradient-to-r from-[#7f0000] to-[#d91414] text-[#ffe9e9] uppercase tracking-[0.14em] text-xs hover:shadow-[0_0_18px_rgba(217,20,20,0.6)] disabled:opacity-60 transition-all"
              >
                {saving ? "Saving..." : "Save Gallery"}
              </button>
            </div>
          </div>
          {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
          {message && <p className="text-emerald-400 mt-4 text-sm">{message}</p>}
        </div>

        <section className="rounded-2xl border border-[#FFD700]/25 bg-black/35 p-5">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <label className="px-4 py-2 border border-[#FFD700]/35 rounded-md text-sm text-[#FFD700] cursor-pointer hover:bg-[#FFD700] hover:text-black transition-all">
              {uploading ? "Uploading..." : "Upload Images"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={async (event) => {
                  const files = Array.from(event.target.files || []);
                  await uploadImages(files);
                  event.target.value = "";
                }}
              />
            </label>
            <input
              value={manualUrl}
              onChange={(event) => setManualUrl(event.target.value)}
              placeholder="Paste image URL"
              className="min-w-[220px] flex-1 px-3 py-2 rounded-md bg-black/50 border border-white/20 focus:border-[#FFD700]/60 outline-none"
            />
            <button
              onClick={() => {
                const url = manualUrl.trim();
                if (!url) return;
                setContent((prev) => ({
                  ...prev,
                  gallery: {
                    ...(prev.gallery || {}),
                    images: [...(prev.gallery?.images || []), url],
                  },
                }));
                setManualUrl("");
              }}
              className="px-4 py-2 rounded-md border border-[#FFD700]/35 text-[#FFD700] text-sm hover:bg-[#FFD700] hover:text-black transition-all"
            >
              Add URL
            </button>
          </div>

          {loading ? (
            <p className="text-gray-300 text-sm">Loading gallery photos...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedGallery.map((entry, sortedIndex) => (
                <div key={`${entry.value}-${entry.originalIndex}`} className="rounded-xl overflow-hidden border border-white/15 bg-black/35">
                  <div className="relative">
                    <img
                      src={resolveMediaUrl(entry.value)}
                      alt={`Gallery ${sortedIndex + 1}`}
                      className="w-full h-44 object-cover"
                    />
                    <button
                      onClick={() =>
                        setContent((prev) => ({
                          ...prev,
                          gallery: {
                            ...(prev.gallery || {}),
                            images: (prev.gallery?.images || []).filter((_, index) => index !== entry.originalIndex),
                          },
                        }))
                      }
                      className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-black/75 border border-red-400 text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="p-3 text-xs text-gray-300">
                    <p className="text-[#FFD700] uppercase tracking-[0.14em] mb-1">#{sortedIndex + 1}</p>
                    <p className="truncate" title={String(entry.value)}>
                      {String(entry.value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style>{`
        .admin-panel-root, .admin-panel-root * {
          cursor: auto !important;
          font-family: "Gamja Flower", cursive !important;
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
        .admin-panel-root input, .admin-panel-root textarea { caret-color: #FFD700; }
      `}</style>
    </div>
  );
}
