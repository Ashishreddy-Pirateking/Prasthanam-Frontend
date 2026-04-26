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
      x: initialPosition.current.x,
      y: initialPosition.current.y,
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

    const handleMove = (event) => {
      if (event.pointerType === "touch") return;

      state.x = event.clientX;
      state.y = event.clientY;
      forceVisible();
      applyPosition(state.x, state.y);
    };

    forceVisible();
    applyPosition(state.x, state.y);

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("pointerdown", handleMove, { passive: true });
    window.addEventListener("pointerrawupdate", handleMove, { passive: true });

    return () => {
      if (styleTag.parentNode) {
        styleTag.parentNode.removeChild(styleTag);
      }

      htmlEl.style.cursor = previousHtmlCursor;
      bodyEl.style.cursor = previousBodyCursor;

      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("pointerdown", handleMove);
      window.removeEventListener("pointerrawupdate", handleMove);
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
          width: "112px",
          height: "112px",
          background:
            "radial-gradient(circle, rgba(255,215,0,0.18) 0%, rgba(255,215,0,0.10) 34%, rgba(255,215,0,0.04) 56%, rgba(0,0,0,0) 78%)",
          filter: "blur(1px)",
          mixBlendMode: "screen",
          transform: initialTransform,
          pointerEvents: "none",
          zIndex: 2147483647,
          opacity: "1",
          display: "block",
          visibility: "visible",
          willChange: "transform, opacity, filter",
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
          width: "7px",
          height: "7px",
          background: "#FFD700",
          borderRadius: "50%",
          transform: initialTransform,
          pointerEvents: "none",
          zIndex: 2147483647,
          boxShadow: "0 0 3px rgba(255,215,0,0.90), 0 0 7px rgba(255,215,0,0.18)",
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
