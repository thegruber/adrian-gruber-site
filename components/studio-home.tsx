"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import type { CSSProperties, PointerEvent } from "react";
import { useRef, useState } from "react";
import { useClientReducedMotion } from "@/components/use-client-reduced-motion";

const pinioHref = "https://www.pinio-app.com/en";
const contactHref = "mailto:hello@guba.studio";
const cursorSpring = { damping: 38, stiffness: 360, mass: 0.85 };

type CursorTarget = {
  element: HTMLElement;
  padding: number;
  radius: number;
};

export function StudioHome() {
  const reduceMotion = useClientReducedMotion();
  const [cursorTarget, setCursorTarget] = useState<CursorTarget | null>(null);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorPressed, setCursorPressed] = useState(false);
  const activeTarget = useRef<CursorTarget | null>(null);
  const cursorX = useMotionValue(-80);
  const cursorY = useMotionValue(-80);
  const cursorWidth = useMotionValue(16);
  const cursorHeight = useMotionValue(16);
  const cursorRadius = useMotionValue(999);
  const latestPointer = useRef({ x: -80, y: -80 });
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { damping: 34, stiffness: 160, mass: 0.7 });
  const smoothY = useSpring(pointerY, { damping: 34, stiffness: 160, mass: 0.7 });
  const pixelX = useTransform(smoothX, [-1, 1], [-8, 8]);
  const pixelY = useTransform(smoothY, [-1, 1], [-5, 5]);

  function moveCursor(clientX: number, clientY: number, target = activeTarget.current) {
    latestPointer.current = { x: clientX, y: clientY };
    pointerX.set((clientX / (window.innerWidth || 1) - 0.5) * 2);
    pointerY.set((clientY / (window.innerHeight || 1) - 0.5) * 2);

    if (!target) {
      cursorX.set(clientX - 8);
      cursorY.set(clientY - 8);
      cursorWidth.set(16);
      cursorHeight.set(16);
      cursorRadius.set(999);
      return;
    }

    const rect = target.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const magneticSnap = 0.78;
    const width = rect.width + target.padding * 2;
    const height = rect.height + target.padding * 2;
    const cursorCenterX = centerX * magneticSnap + clientX * (1 - magneticSnap);
    const cursorCenterY = centerY * magneticSnap + clientY * (1 - magneticSnap);

    cursorX.set(cursorCenterX - width / 2);
    cursorY.set(cursorCenterY - height / 2);
    cursorWidth.set(width);
    cursorHeight.set(height);
    cursorRadius.set(target.radius);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (reduceMotion) return;

    moveCursor(event.clientX, event.clientY);
  }

  function setCursorAround(element: HTMLElement, event?: PointerEvent<HTMLElement>, padding = 8, radius = 22) {
    const target = { element, padding, radius };
    activeTarget.current = target;
    setCursorTarget(target);

    const rect = element.getBoundingClientRect();
    moveCursor(event?.clientX ?? rect.left + rect.width / 2, event?.clientY ?? rect.top + rect.height / 2, target);
  }

  function resetCursor(event?: PointerEvent<HTMLElement>) {
    activeTarget.current = null;
    setCursorTarget(null);
    moveCursor(event?.clientX ?? latestPointer.current.x, event?.clientY ?? latestPointer.current.y, null);
  }

  const cursorHandlers = (padding = 8, radius = 22) => ({
    onPointerEnter: (event: PointerEvent<HTMLElement>) => setCursorAround(event.currentTarget, event, padding, radius),
    onPointerLeave: (event: PointerEvent<HTMLElement>) => resetCursor(event),
    onPointerMove: (event: PointerEvent<HTMLElement>) => setCursorAround(event.currentTarget, event, padding, radius),
  });

  return (
    <main
      className="home-canvas personal-canvas bg-paper text-ink"
      onPointerEnter={() => setCursorVisible(true)}
      onPointerLeave={() => setCursorVisible(false)}
      onPointerMove={handlePointerMove}
      onPointerDown={() => setCursorPressed(true)}
      onPointerUp={() => setCursorPressed(false)}
    >
      <PersonalCursor
        pressed={cursorPressed}
        target={cursorTarget}
        visible={cursorVisible && !reduceMotion}
        height={cursorHeight}
        radius={cursorRadius}
        width={cursorWidth}
        x={cursorX}
        y={cursorY}
      />
      <PersonalHeader cursorHandlers={cursorHandlers} />

      <section className="personal-frame" aria-labelledby="personal-title">
        <div className="personal-hero">
          <motion.div
            className="personal-copy"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.66, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="personal-kicker font-mono">product design / frontend engineering</p>
            <h1 id="personal-title" className="personal-title">
              I design and build products that feel simple to use.
            </h1>
            <p className="personal-intro">
              Currently building Pinio and small product experiments under guba.studio{" "}
              <span className="smile-mark" aria-hidden="true">
                :)
              </span>
            </p>
          </motion.div>

          <motion.a
            aria-label="Open Pinio"
            className="pixel-work"
            href={pinioHref}
            {...cursorHandlers(7, 28)}
            rel="noreferrer"
            style={reduceMotion ? undefined : { x: pixelX, y: pixelY }}
            target="_blank"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="pixel-work-top font-mono">
              <span>01 / Pinio</span>
              <span>open</span>
            </span>
            <DotMatrixSignature />
            <span className="pixel-work-bottom">
              <span>AI link organizer for saved TikToks, Reels, recipes, places, and videos.</span>
            </span>
          </motion.a>
        </div>

        <footer className="personal-footer">
          <a
            href={contactHref}
            {...cursorHandlers(8, 22)}
          >
            hello@guba.studio
          </a>
          <span>Madrid / 2026</span>
        </footer>
      </section>
    </main>
  );
}

function PersonalHeader({
  cursorHandlers,
}: {
  cursorHandlers: (padding?: number, radius?: number) => {
    onPointerEnter: (event: PointerEvent<HTMLElement>) => void;
    onPointerLeave: (event: PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  };
}) {
  return (
    <header className="site-header fixed inset-x-0 top-0 z-40 flex items-start justify-between gap-6 px-5 py-5 text-[0.78rem] leading-relaxed md:px-10 md:py-7 md:text-[0.9rem]">
      <Link
        className="w-max transition-opacity hover:opacity-55"
        href="/"
        {...cursorHandlers(8, 22)}
        aria-label="Adrian Gruber home"
      >
        Adrian Gruber
      </Link>
      <nav className="flex justify-end gap-6 md:gap-12" aria-label="Primary navigation">
        <a
          className="transition-opacity hover:opacity-55"
          href={pinioHref}
          {...cursorHandlers(8, 22)}
          rel="noreferrer"
          target="_blank"
        >
          work
        </a>
        <a
          className="transition-opacity hover:opacity-55"
          href={contactHref}
          {...cursorHandlers(8, 22)}
        >
          contact
        </a>
      </nav>
    </header>
  );
}

const pixelGlyphs: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
};

const dotCells = Array.from({ length: 24 * 38 }, (_, index) => {
  const col = index % 38;
  const row = Math.floor(index / 38);
  const scale = 3;
  const startY = 1;
  const startX = 2;
  const gap = 3;

  function isLetterDot(letter: "A" | "G", offsetX: number) {
    const localCol = col - offsetX;
    const localRow = row - startY;

    if (localCol < 0 || localRow < 0) return false;

    const patternCol = Math.floor(localCol / scale);
    const patternRow = Math.floor(localRow / scale);

    if (patternRow >= 7 || patternCol >= 5) return false;

    return pixelGlyphs[letter][patternRow][patternCol] === "1";
  }

  const active = isLetterDot("A", startX) || isLetterDot("G", startX + 5 * scale + gap);
  const shimmer = (row * 17 + col * 11) % 9;

  return {
    active,
    delay: `${(row * 26 + col * 12) % 1400}ms`,
    index,
    opacity: active ? 0.78 + shimmer * 0.018 : 0.18 + shimmer * 0.018,
  };
});

function DotMatrixSignature() {
  return (
    <span className="dot-signature" aria-hidden="true">
      {dotCells.map((cell) => (
        <span
          className={`dot-signature-cell${cell.active ? " is-active" : ""}`}
          key={cell.index}
          style={
            {
              "--dot-delay": cell.delay,
              "--dot-opacity": cell.opacity,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

function PersonalCursor({
  height,
  pressed,
  radius,
  target,
  visible,
  width,
  x,
  y,
}: {
  height: MotionValue<number>;
  pressed: boolean;
  radius: MotionValue<number>;
  target: CursorTarget | null;
  visible: boolean;
  width: MotionValue<number>;
  x: MotionValue<number>;
  y: MotionValue<number>;
}) {
  const hasTarget = Boolean(target);
  const smoothCursorX = useSpring(x, cursorSpring);
  const smoothCursorY = useSpring(y, cursorSpring);
  const smoothWidth = useSpring(width, cursorSpring);
  const smoothHeight = useSpring(height, cursorSpring);
  const smoothRadius = useSpring(radius, cursorSpring);

  return (
    <motion.div
      className={`soft-cursor ${hasTarget ? "soft-cursor-target" : "soft-cursor-idle"}${pressed ? " is-pressed" : ""}`}
      aria-hidden="true"
      animate={{ opacity: visible ? 1 : 0, scale: pressed ? 0.97 : 1 }}
      style={{
        borderRadius: smoothRadius,
        height: smoothHeight,
        left: smoothCursorX,
        top: smoothCursorY,
        width: smoothWidth,
      }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
