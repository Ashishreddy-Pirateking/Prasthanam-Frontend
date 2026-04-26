import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

const getInitialPosition = () => {
  if (typeof window === "undefined") {
    return { x: 0, y: 0 };
  }

  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
};

export default function CursorSpotlight() {
  const cursRef = useRef(null);
  const spotRef = useRef(null);
  const initialPosition = useRef(getInitialPosition());

  useLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;

    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const previousHtmlCursor = htmlEl.style.cursor;
    const previousBodyCursor = bodyEl.style.cursor;
    bodyEl.classList.remove("native-cursor-viewer");

    const styleTag = document.createElement("style");
    styleTag.textContent =
      "html, body, body *, body *::before, body *::after, input, textarea, select, button, a, [role='button'] { cursor: none !important; }";
    document.head.appendChild(styleTag);
    htmlEl.style.setProperty("cursor", "none", "important");
    bodyEl.style.setProperty("cursor", "none", "important");

    const state = {
      currentX: initialPosition.current.x,
      currentY: initialPosition.current.y,
      targetX: initialPosition.current.x,
      targetY: initialPosition.current.y,
      frameId: 0,
    };

    const forceVisible = () => {
      if (spotRef.current) {
        spotRef.current.style.setProperty("position", "fixed", "important");
        spotRef.current.style.setProperty("top", "0px", "important");
        spotRef.current.style.setProperty("left", "0px", "important");
        spotRef.current.style.setProperty("z-index", "2147483647", "important");
        spotRef.current.style.setProperty("pointer-events", "none", "important");
        spotRef.current.style.setProperty("display", "block", "important");
        spotRef.current.style.setProperty("visibility", "visible", "important");
        spotRef.current.style.setProperty("opacity", "1", "important");
      }

      if (cursRef.current) {
        cursRef.current.style.setProperty("position", "fixed", "important");
        cursRef.current.style.setProperty("top", "0px", "important");
        cursRef.current.style.setProperty("left", "0px", "important");
        cursRef.current.style.setProperty("z-index", "2147483647", "important");
        cursRef.current.style.setProperty("pointer-events", "none", "important");
        cursRef.current.style.setProperty("display", "block", "important");
        cursRef.current.style.setProperty("visibility", "visible", "important");
        cursRef.current.style.setProperty("opacity", "1", "important");
      }
    };

    const applyPosition = (x, y) => {
      const transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;

      if (spotRef.current) {
        spotRef.current.style.transform = transform;
      }

      if (cursRef.current) {
        cursRef.current.style.transform = transform;
      }
    };

    const tick = () => {
      state.currentX += (state.targetX - state.currentX) * 0.18;
      state.currentY += (state.targetY - state.currentY) * 0.18;
      forceVisible();
      applyPosition(state.currentX, state.currentY);

      const settled =
        Math.abs(state.targetX - state.currentX) < 0.05 &&
        Math.abs(state.targetY - state.currentY) < 0.05;

      if (settled) {
        state.currentX = state.targetX;
        state.currentY = state.targetY;
        applyPosition(state.currentX, state.currentY);
        state.frameId = 0;
        return;
      }

      state.frameId = window.requestAnimationFrame(tick);
    };

    const ensureAnimation = () => {
      if (!state.frameId) {
        state.frameId = window.requestAnimationFrame(tick);
      }
    };

    const handleMove = (event) => {
      if (event.pointerType === "touch") return;

      state.targetX = event.clientX;
      state.targetY = event.clientY;
      forceVisible();
      ensureAnimation();
    };

    forceVisible();
    applyPosition(state.currentX, state.currentY);

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("pointerdown", handleMove, { passive: true });

    return () => {
      if (state.frameId) {
        window.cancelAnimationFrame(state.frameId);
      }

      if (styleTag.parentNode) {
        styleTag.parentNode.removeChild(styleTag);
      }

      htmlEl.style.cursor = previousHtmlCursor;
      bodyEl.style.cursor = previousBodyCursor;

      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("pointerdown", handleMove);
    };
  }, []);

  if (typeof document === "undefined") return null;

  const { x, y } = initialPosition.current;
  const initialTransform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;

  return createPortal(
    <>
      <div
        id="spot"
        ref={spotRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "0px",
          left: "0px",
          width: "200px",
          height: "200px",
          background:
            "radial-gradient(circle, rgba(255,215,0,0.24) 0%, rgba(255,215,0,0.12) 22%, rgba(0,0,0,0) 72%)",
          mixBlendMode: "screen",
          transform: initialTransform,
          pointerEvents: "none",
          zIndex: 2147483647,
          opacity: "1",
          display: "block",
          visibility: "visible",
          transition: "opacity .16s ease",
          willChange: "transform, opacity",
          borderRadius: "50%",
        }}
      />
      <div
        id="curs"
        ref={cursRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "0px",
          left: "0px",
          width: "10px",
          height: "10px",
          background: "radial-gradient(circle, #fff8d9 0%, var(--gold) 55%, #c48d00 100%)",
          borderRadius: "50%",
          transform: initialTransform,
          pointerEvents: "none",
          zIndex: 2147483647,
          boxShadow: "0 0 12px rgba(255,215,0,0.95), 0 0 30px rgba(255,215,0,0.32)",
          opacity: "1",
          display: "block",
          visibility: "visible",
          willChange: "transform",
        }}
      />
    </>,
    document.body
  );
}
