import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import backgroundVideo from "../Legacy/background.mp4";
import {
  LOCAL_GALLERY_ARCHIVE_IMAGES,
  LOCAL_GALLERY_SCENE_IMAGES,
} from "../data/localGalleryImages";
import { useSiteContent } from "../context/SiteContentContext";
import { resolveMediaUrl } from "../utils/media";

const INITIAL_VISIBLE_GALLERY_IMAGES = 12;
const GALLERY_BATCH_SIZE = 12;
const STAR_COUNT = 3000;
const MOBILE_BREAKPOINT = 768;

export default function Gallery() {
  const mountRef = useRef(null);
  const [modalSrc, setModalSrc] = useState(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [isGalleryReady, setIsGalleryReady] = useState(false);
  const [visibleGalleryCount, setVisibleGalleryCount] = useState(INITIAL_VISIBLE_GALLERY_IMAGES);
  const { siteContent } = useSiteContent();
  const backToHref = useMemo(() => {
    const fallback = "/?skipCurtain=1&fromGallery=1#galleryCta";
    try {
      const params = new URLSearchParams(window.location.search);
      const returnTo = String(params.get("returnTo") || "").trim();
      if (!returnTo || !returnTo.startsWith("/")) return fallback;

      const returnUrl = new URL(returnTo, window.location.origin);
      const nextParams = new URLSearchParams(returnUrl.search);
      nextParams.set("skipCurtain", "1");
      nextParams.set("fromGallery", "1");

      const query = nextParams.toString();
      const hash = returnUrl.hash || "#galleryCta";
      return `${returnUrl.pathname}${query ? `?${query}` : ""}${hash}`;
    } catch {
      return fallback;
    }
  }, []);

  const siteGalleryImages = useMemo(() => {
    const refs = siteContent?.gallery?.images || [];
    return refs.map((ref) => resolveMediaUrl(ref)).filter(Boolean);
  }, [siteContent]);

  const archiveGalleryImages = useMemo(() => {
    const combined = [...siteGalleryImages, ...LOCAL_GALLERY_ARCHIVE_IMAGES];
    const seen = new Set();
    return combined.filter((src) => {
      if (typeof src !== "string" || !src.trim()) return false;
      const key = src.split("/").pop().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [siteGalleryImages]);

  const sceneGalleryImages = useMemo(() => {
    const baseImages = archiveGalleryImages.length
      ? archiveGalleryImages
      : LOCAL_GALLERY_SCENE_IMAGES;

    return baseImages
      .filter((src) => typeof src === "string" && src.trim())
      .map((src) => src) // skip optimization temporarily
      .filter(Boolean);
  }, [archiveGalleryImages]);

  const visibleGalleryImages = useMemo(
    () => archiveGalleryImages.slice(0, visibleGalleryCount),
    [archiveGalleryImages, visibleGalleryCount]
  );
  const hasMoreGalleryImages = visibleGalleryCount < archiveGalleryImages.length;

  useEffect(() => {
    document.body.classList.add("gallery-page");
    return () => document.body.classList.remove("gallery-page");
  }, []);

  const loadMoreGalleryImages = () => {
    setVisibleGalleryCount((current) => Math.min(current + GALLERY_BATCH_SIZE, archiveGalleryImages.length));
  };

  const openAllPhotos = () => {
    setModalSrc(null);
    setVisibleGalleryCount(Math.min(INITIAL_VISIBLE_GALLERY_IMAGES, archiveGalleryImages.length));
    setShowAllPhotos(true);
  };

  const handleGalleryScroll = (event) => {
    if (!hasMoreGalleryImages) return;
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 220) {
      loadMoreGalleryImages();
    }
  };

  useEffect(() => {
  const hardFallback = window.setTimeout(() => {
    setIsGalleryReady(true);
  }, 3000);
  return () => window.clearTimeout(hardFallback);
}, []);

  useEffect(() => {
    if (!mountRef.current) return;
    if (sceneGalleryImages.length === 0) {
      const readyTimer = window.setTimeout(() => {
        setIsGalleryReady(true);
      }, 0);
      return () => window.clearTimeout(readyTimer);
    }

    const resetReadyTimer = window.setTimeout(() => {
      setIsGalleryReady(false);
    }, 50);
    const isMobileViewport = window.innerWidth <= MOBILE_BREAKPOINT;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 120, 320);
    scene.background = new THREE.Color(0x050505);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 90);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobileViewport,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobileViewport ? 1 : Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMappingExposure = 0.85;
    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.zIndex = "0";
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isMobileViewport;
    controls.dampingFactor = isMobileViewport ? 0 : 0.04;
    controls.enablePan = false;

    const bgVideo = document.createElement("video");
    bgVideo.src = backgroundVideo;
    bgVideo.preload = "metadata";
    bgVideo.loop = true;
    bgVideo.muted = true;
    bgVideo.playsInline = true;
    bgVideo.autoplay = true;
    bgVideo.setAttribute("playsinline", "true");
    bgVideo.setAttribute("webkit-playsinline", "true");
    bgVideo.disablePictureInPicture = true;
    bgVideo.load();

    const playVideo = () => {
      const playPromise = bgVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    };
    const onVideoReady = () => {
      playVideo();
      scene.background = videoTexture;
    };
    const onVideoRecover = () => {
      playVideo();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        playVideo();
      }
    };

    const videoTexture = new THREE.VideoTexture(bgVideo);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;
    bgVideo.addEventListener("canplay", onVideoReady);
    bgVideo.addEventListener("loadeddata", onVideoReady);
    bgVideo.addEventListener("stalled", onVideoRecover);
    bgVideo.addEventListener("waiting", onVideoRecover);
    document.addEventListener("visibilitychange", onVisibilityChange);
    renderer.toneMappingExposure = 1.05;

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(10, 20, 10);
    scene.add(dir);

    const photoGroup = new THREE.Group();
    scene.add(photoGroup);

    const photoGeometry = new THREE.PlaneGeometry(5.5, 7.4);
    const frameGeometry = new THREE.PlaneGeometry(6.2, 8.2);
    const frameMaterial = new THREE.MeshBasicMaterial({
      color: 0x050505,
      side: THREE.DoubleSide,
    });

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    const maxAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    const applyTextureOptions = (texture) => {
      if (!texture) return;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = maxAnisotropy;
    };

    const createPlaceholderTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 86;
      const context = canvas.getContext("2d");
      if (context) {
        const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#2b1f08");
        gradient.addColorStop(1, "#090808");
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "rgba(255, 215, 0, 0.28)";
        context.fillRect(0, 0, canvas.width, 4);
        context.fillRect(0, canvas.height - 4, canvas.width, 4);
        context.fillStyle = "#f0d27a";
        context.font = "700 10px Cinzel, serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("Loading", canvas.width / 2, canvas.height / 2 - 6);
        context.font = "500 7px Cinzel, serif";
        context.fillText("gallery", canvas.width / 2, canvas.height / 2 + 8);
      }
      const generatedPlaceholder = new THREE.CanvasTexture(canvas);
      applyTextureOptions(generatedPlaceholder);
      return generatedPlaceholder;
    };

    const placeholderTexture = createPlaceholderTexture();
    const allTextures = [placeholderTexture];
    const materials = [];
    const materialCache = new Map();
    const textureCache = new Map();
    let isEffectActive = true;
    const autoRevealTimer = window.setTimeout(() => {
  setIsGalleryReady(true);
}, 800);

    const loadTexture = (src) => {
      const normalizedSrc = String(src || "").trim();
      if (!normalizedSrc) return Promise.resolve(null);
      if (textureCache.has(normalizedSrc)) return textureCache.get(normalizedSrc);

      const texturePromise = new Promise((resolve) => {
        const loadedTexture = textureLoader.load(
          normalizedSrc,
          (readyTexture) => {
            if (!isEffectActive) {
              readyTexture.dispose();
              resolve(null);
              return;
            }
            applyTextureOptions(readyTexture);
            allTextures.push(readyTexture);
            resolve(readyTexture);
          },
          undefined,
          () => resolve(null)
        );
        applyTextureOptions(loadedTexture);
      });

      textureCache.set(normalizedSrc, texturePromise);
      return texturePromise;
    };

    const getMaterialForImage = (src, index) => {
      const normalizedSrc = String(src || "").trim();
      const cacheKey = normalizedSrc || `fallback-${index}`;
      if (materialCache.has(cacheKey)) return materialCache.get(cacheKey);

      const material = new THREE.MeshBasicMaterial({
        map: placeholderTexture,
        color: normalizedSrc ? 0xffffff : 0x1a1a1a,
        side: THREE.DoubleSide,
      });
      materials.push(material);
      materialCache.set(cacheKey, material);

      if (!normalizedSrc) return material;

      loadTexture(normalizedSrc).then((readyTexture) => {
        if (!isEffectActive || !readyTexture) return;
        material.map = readyTexture;
        material.color.setHex(0xffffff);
        material.needsUpdate = true;
      });
      return material;
    };

    const sceneImagePool = sceneGalleryImages;
    const sceneCardCount = sceneImagePool.length;

    for (let i = 0; i < sceneCardCount; i += 1) {
      const cardImage = sceneImagePool[i % sceneImagePool.length];
      const backImage =
        sceneImagePool.length > 1
          ? sceneImagePool[(i + Math.ceil(sceneImagePool.length / 2)) % sceneImagePool.length]
          : cardImage;
      const frontMat = getMaterialForImage(cardImage, i);
      const backMat = getMaterialForImage(backImage, i + 500);
      const cardGroup = new THREE.Group();
      const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
      const frontPhotoMesh = new THREE.Mesh(photoGeometry, frontMat);
      frontPhotoMesh.position.z = 0.03;
      const backPhotoMesh = new THREE.Mesh(photoGeometry, backMat);
      backPhotoMesh.position.z = -0.03;
      backPhotoMesh.rotation.y = Math.PI;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 30 + Math.random() * 32;

      cardGroup.add(frameMesh);
      cardGroup.add(frontPhotoMesh);
      cardGroup.add(backPhotoMesh);

      frameMesh.userData.image = cardImage;
      frontPhotoMesh.userData.image = cardImage;
      backPhotoMesh.userData.image = backImage;

      cardGroup.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
      cardGroup.lookAt(0, 0, 0);
      cardGroup.userData = {
        spin: (Math.random() - 0.5) * 0.001,
      };
      photoGroup.add(cardGroup);
    }

    const createStarTexture = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 32;
      const ctx = c.getContext("2d");
      const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.3, "rgba(200,220,255,0.8)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 32, 32);
      return new THREE.CanvasTexture(c);
    };

    const starCount = STAR_COUNT;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starPos.length; i += 1) {
      starPos[i] = (Math.random() - 0.5) * 400;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.6,
      map: createStarTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const isDragging = { current: false };

    const onMouseDown = () => {
      isDragging.current = false;
    };
    const onMouseMove = (event) => {
      isDragging.current = true;
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      document.body.style.cursor =
        raycaster.intersectObjects(photoGroup.children, true).length > 0 ? "pointer" : "default";
    };
    const onClick = (event) => {
      if (isDragging.current) return;
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hit = raycaster.intersectObjects(photoGroup.children, true)[0];
      if (hit?.object?.userData?.image) setModalSrc(hit.object.userData.image);
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);

    let animationId;
    let hasFirstFrame = false;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      starField.rotation.y += 0.0004;
      photoGroup.rotation.y += 0.0012;
      photoGroup.children.forEach((child) => {
        child.rotation.z += child.userData.spin;
      });
      controls.update();
      renderer.render(scene, camera);
      if (!hasFirstFrame) {
        hasFirstFrame = true;
        window.clearTimeout(autoRevealTimer);
        setIsGalleryReady(true);
      }
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.innerWidth <= MOBILE_BREAKPOINT ? 1 : Math.min(window.devicePixelRatio || 1, 1.25));
    };
    window.addEventListener("resize", onResize);

    return () => {
      isEffectActive = false;
      window.clearTimeout(resetReadyTimer);
      window.clearTimeout(autoRevealTimer);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);

      cancelAnimationFrame(animationId);
      controls.dispose();
      photoGeometry.dispose();
      frameGeometry.dispose();
      frameMaterial.dispose();
      materials.forEach((mat) => mat.dispose());
      allTextures.forEach((tex) => tex.dispose());
      starGeo.dispose();
      starMat.dispose();
      videoTexture.dispose();
      placeholderTexture.dispose();
      renderer.dispose();
      bgVideo.removeEventListener("canplay", onVideoReady);
      bgVideo.removeEventListener("loadeddata", onVideoReady);
      bgVideo.removeEventListener("stalled", onVideoRecover);
      bgVideo.removeEventListener("waiting", onVideoRecover);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      bgVideo.pause();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [sceneGalleryImages.length]);

  return (
    <div className="gallery-page-root">
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999998,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          background:
            "radial-gradient(circle at 50% 42%, rgba(255,215,0,0.16), rgba(8,8,8,0.97) 55%, rgba(0,0,0,1) 100%)",
          color: "#FFD700",
          fontFamily: "'Cinzel', serif",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          opacity: isGalleryReady ? 0 : 1,
          pointerEvents: isGalleryReady ? "none" : "auto",
          transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          style={{
            width: "54px",
            height: "54px",
            borderRadius: "999px",
            border: "2px solid rgba(255,215,0,0.35)",
            borderTopColor: "#FFD700",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <p style={{ margin: 0, fontSize: "13px" }}>Loading Galaxy Gallery</p>
      </div>
      <a href={backToHref} className="back-stage-btn">
        Back to Stage
      </a>
      <p className="gallery-scroll-hint">Scroll down to move through the photos</p>
      <button
        type="button"
        className="gallery-view-all-btn"
        onClick={openAllPhotos}
      >
        View all
      </button>
      <div id="cinematic-dim"></div>

      <div id="modal" className={modalSrc ? "active" : ""} onClick={(event) => event.target.id === "modal" && setModalSrc(null)}>
        <div id="modal-content">
          <div id="close-btn" onClick={() => setModalSrc(null)}>
            ✖
          </div>
          {modalSrc ? <img id="modal-img" src={modalSrc} alt="" loading="lazy" decoding="async" /> : null}
        </div>
      </div>

      <div ref={mountRef} />
      <div id="galaxy-mesh"></div>

      {showAllPhotos && (
        <div
          className="gallery-all-overlay"
          onScroll={handleGalleryScroll}
          onClick={(event) => {
            if (event.target === event.currentTarget) setShowAllPhotos(false);
          }}
        >
          <div className="gallery-all-shell">
            <div className="gallery-all-head">
              <div className="gallery-all-title-wrap">
                <p className="gallery-all-kicker">Prasthanam Archive</p>
                <h2>All Photos</h2>
                <p className="gallery-all-subtitle">Cinematic contact sheet of every frame</p>
              </div>
              <div className="gallery-all-actions">
                {hasMoreGalleryImages && (
                  <button type="button" onClick={loadMoreGalleryImages}>
                    Load More
                  </button>
                )}
                <button type="button" onClick={() => setShowAllPhotos(false)}>
                  Close
                </button>
              </div>
            </div>
            <div className="gallery-all-grid">
              {visibleGalleryImages.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  className="gallery-all-item"
                  onClick={() => setModalSrc(src)}
                >
                  <span className="gallery-sprocket top" aria-hidden="true" />
                  {src ? <img src={src} alt={`Gallery ${index + 1}`} loading="lazy" decoding="async" /> : null}
                  <div className="gallery-all-caption">
                    <span className="gallery-all-index">Frame #{index + 1}</span>
                  </div>
                  <span className="gallery-sprocket bottom" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg);}}
        .gallery-view-all-btn{
          position:fixed;
          right:14px;
          bottom:14px;
          z-index:1000002;
          min-width:140px;
          height:54px;
          border:1px solid rgba(255,215,0,0.6);
          border-radius:999px;
          background:rgba(0,0,0,0.92);
          color:#FFD700;
          font-family:'Cinzel',serif;
          font-size:16px;
          letter-spacing:0.08em;
          text-transform:uppercase;
          box-shadow:0 0 20px rgba(0,0,0,0.6);
        }
        .gallery-view-all-btn:hover{
          background:#FFD700;
          color:#111;
        }
        .gallery-all-overlay{
          position:fixed;
          inset:0;
          z-index:1000003;
          background:
            radial-gradient(circle at 50% 5%, rgba(255, 210, 80, 0.2), rgba(6, 7, 18, 0.95) 38%, rgba(0, 0, 0, 0.98) 100%);
          backdrop-filter:blur(5px);
          padding:20px;
          overflow:auto;
        }
        .gallery-all-shell{
          max-width:1320px;
          margin:0 auto;
          border:1px solid rgba(255,215,0,0.28);
          border-radius:22px;
          background:
            linear-gradient(150deg, rgba(8, 13, 28, 0.96) 0%, rgba(5, 9, 20, 0.96) 56%, rgba(12, 8, 20, 0.95) 100%);
          padding:24px;
          box-shadow:
            0 22px 60px rgba(0,0,0,0.62),
            inset 0 1px 0 rgba(255,255,255,0.06),
            0 0 35px rgba(255,215,0,0.12);
        }
        .gallery-all-head{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:18px;
          margin-bottom:20px;
          padding-bottom:16px;
          border-bottom:1px solid rgba(255, 215, 0, 0.18);
        }
        .gallery-all-title-wrap{
          display:grid;
          gap:6px;
        }
        .gallery-all-kicker{
          margin:0;
          color:rgba(255, 217, 124, 0.88);
          font-family:'Cinzel',serif;
          font-size:12px;
          letter-spacing:0.28em;
          text-transform:uppercase;
        }
        .gallery-all-subtitle{
          margin:0;
          color:rgba(227, 230, 244, 0.72);
          font-size:13px;
          letter-spacing:0.08em;
          text-transform:uppercase;
        }
        .gallery-all-head h2{
          margin:0;
          color:#FFD700;
          font-family:'Cinzel',serif;
          letter-spacing:0.2em;
          text-transform:uppercase;
          font-size:34px;
          text-shadow:0 0 20px rgba(255, 191, 0, 0.25);
        }
        .gallery-all-actions{
          display:flex;
          align-items:center;
          gap:10px;
          flex-wrap:wrap;
          justify-content:flex-end;
        }
        .gallery-all-head button{
          border:1px solid rgba(255,215,0,0.45);
          background:linear-gradient(180deg, rgba(20, 22, 34, 0.9), rgba(8, 10, 18, 0.95));
          color:#FFD700;
          border-radius:12px;
          padding:10px 16px;
          text-transform:uppercase;
          letter-spacing:0.16em;
          font-size:11px;
          font-family:'Cinzel',serif;
        }
        .gallery-all-head button:hover{
          background:#FFD700;
          color:#111;
        }
        .gallery-all-grid{
          display:grid;
          grid-template-columns:repeat(4,minmax(0,1fr));
          column-gap:0;
          row-gap:24px;
        }
        .gallery-all-item{
          position:relative;
          border-top:1px solid rgba(255, 221, 136, 0.32);
          border-bottom:1px solid rgba(255, 221, 136, 0.32);
          border-right:1px solid rgba(255, 221, 136, 0.32);
          border-left:0;
          background:linear-gradient(180deg, rgba(21, 18, 14, 0.96), rgba(10, 10, 13, 0.96));
          border-radius:0;
          overflow:hidden;
          text-align:left;
          padding:14px 14px 12px;
          color:#f4f4f4;
          box-shadow:inset 0 0 0 1px rgba(255,255,255,0.03);
          transition:transform .28s ease, border-color .28s ease, box-shadow .28s ease, filter .28s ease;
        }
        .gallery-all-item:nth-child(4n + 1){
          border-left:1px solid rgba(255, 221, 136, 0.32);
          border-top-left-radius:14px;
          border-bottom-left-radius:14px;
        }
        .gallery-all-item:nth-child(4n){
          border-top-right-radius:14px;
          border-bottom-right-radius:14px;
        }
        .gallery-all-item:last-child{
          border-top-right-radius:14px;
          border-bottom-right-radius:14px;
        }
        .gallery-all-item:hover{
          z-index:2;
          transform:translateY(-5px) scale(1.012);
          border-color:rgba(255,215,0,0.72);
          box-shadow:
            0 12px 24px rgba(0,0,0,0.52),
            0 0 22px rgba(255,196,0,0.18);
          filter:brightness(1.04);
        }
        .gallery-sprocket{
          position:absolute;
          left:0;
          right:0;
          height:10px;
          background:
            repeating-linear-gradient(
              90deg,
              rgba(255, 224, 156, 0.95) 0 10px,
              rgba(28, 21, 14, 0.95) 10px 20px
            );
          opacity:0.88;
          border-radius:2px;
          pointer-events:none;
        }
        .gallery-sprocket.top{
          top:6px;
        }
        .gallery-sprocket.bottom{
          bottom:42px;
        }
        .gallery-all-item img{
          width:100%;
          height:240px;
          object-fit:cover;
          display:block;
          border:1px solid rgba(255,255,255,0.08);
          border-radius:10px;
        }
        .gallery-all-caption{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:8px;
          padding-top:10px;
        }
        .gallery-all-index{
          display:block;
          font-size:11px;
          color:#ffd76c;
          letter-spacing:0.14em;
          text-transform:uppercase;
          font-family:'Cinzel',serif;
        }
        @media (max-width: 760px){
          .gallery-all-shell{
            padding:16px;
            border-radius:16px;
          }
          .gallery-all-head{
            flex-direction:column;
            align-items:flex-start;
          }
          .gallery-all-head h2{
            font-size:26px;
          }
          .gallery-all-actions{
            width:100%;
            justify-content:flex-start;
          }
          .gallery-all-grid{
            grid-template-columns:repeat(2,minmax(0,1fr));
            column-gap:0;
            row-gap:12px;
          }
          .gallery-all-item{
            padding:10px 10px 10px;
            border-left:0;
            border-radius:0;
          }
          .gallery-all-item:nth-child(2n + 1){
            border-left:1px solid rgba(255, 221, 136, 0.32);
            border-top-left-radius:12px;
            border-bottom-left-radius:12px;
          }
          .gallery-all-item:nth-child(2n){
            border-top-right-radius:12px;
            border-bottom-right-radius:12px;
          }
          .gallery-all-item:hover{
            transform:translateY(-3px);
          }
          .gallery-all-item img{
            height:180px;
          }
          .gallery-sprocket{
            left:0;
            right:0;
          }
          .gallery-sprocket.bottom{
            bottom:34px;
          }
        }
      `}</style>
    </div>
  );
}
