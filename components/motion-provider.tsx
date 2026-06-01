"use client";

import Lenis from "lenis";
import { type ReactNode, useEffect } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotion.matches) {
      document.documentElement.classList.add("reduced-motion");
      return;
    }

    const lenis = new Lenis({
      duration: 1.18,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
    });

    document.documentElement.classList.add("lenis-ready");

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };

    frame = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
      document.documentElement.classList.remove("lenis-ready");
    };
  }, []);

  return children;
}
