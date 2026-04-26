import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const state = {
      currentX: initialPosition.current.x,
      currentY: initialPosition.current.y,
      targetX: initialPosition.current.x,
      targetY: initialPosition.current.y,
      frameId: 0,
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

    const setVisible = (visible) => {
      const opacity = visible ? "1" : "0";

      if (spotRef.current) {
        spotRef.current.style.opacity = opacity;
      }

      if (cursRef.current) {
        cursRef.current.style.opacity = opacity;
      }
    };

    const tick = () => {
      state.currentX += (state.targetX - state.currentX) * 0.18;
      state.currentY += (state.targetY - state.currentY) * 0.18;
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
      setVisible(true);
      ensureAnimation();
    };

    const handleBlur = () => setVisible(false);

    const handleFocus = () => {
      setVisible(true);
      ensureAnimation();
    };

    const handleVisibilityChange = () => {
      const visible = document.visibilityState === "visible";
      setVisible(visible);

      if (visible) {
        ensureAnimation();
      }
    };

    applyPosition(state.currentX, state.currentY);
    setVisible(true);

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("pointerdown", handleMove, { passive: true });
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (state.frameId) {
        window.cancelAnimationFrame(state.frameId);
      }

      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("pointerdown", handleMove);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(255,215,0,0.5) 0%, rgba(255,215,0,0.25) 30%, rgba(0,0,0,0) 70%)",
          transform: initialTransform,
          pointerEvents: "none",
          zIndex: 2147483647,
          opacity: "1",
          display: "block",
          willChange: "transform",
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
          background: "radial-gradient(circle, #fff8d9 0%, #FFD700 55%, #c48d00 100%)",
          borderRadius: "50%",
          transform: initialTransform,
          pointerEvents: "none",
          zIndex: 2147483647,
          boxShadow: "0 0 12px rgba(255,215,0,0.95), 0 0 30px rgba(255,215,0,0.32)",
          opacity: "1",
          display: "block",
          willChange: "transform",
        }}
      />
    </>,
    document.body
  );
}
