"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "motion/react";
import type { MotionValue } from "motion/react";
import type { CSSProperties, PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useClientReducedMotion } from "@/components/use-client-reduced-motion";

const contactHref = "mailto:hello@guba.studio";
const workHref = "/work";
const cursorSpring = { damping: 38, stiffness: 360, mass: 0.85 };
const revealEase = [0.22, 1, 0.36, 1] as const;

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
  const [cursorStretched, setCursorStretched] = useState(false);
  const [workPreviewVisible, setWorkPreviewVisible] = useState(false);
  const activeTarget = useRef<CursorTarget | null>(null);
  const stretchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorX = useMotionValue(-80);
  const cursorY = useMotionValue(-80);
  const cursorWidth = useMotionValue(16);
  const cursorHeight = useMotionValue(16);
  const cursorRadius = useMotionValue(999);
  const latestPointer = useRef({ x: -80, y: -80 });

  useEffect(() => {
    return () => {
      if (stretchTimeout.current) clearTimeout(stretchTimeout.current);
    };
  }, []);

  function pulseCursor() {
    setCursorStretched(true);
    if (stretchTimeout.current) clearTimeout(stretchTimeout.current);
    stretchTimeout.current = setTimeout(() => setCursorStretched(false), 170);
  }

  function moveCursor(clientX: number, clientY: number, target = activeTarget.current) {
    latestPointer.current = { x: clientX, y: clientY };

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
    const isNewTarget = activeTarget.current?.element !== element;
    const target = { element, padding, radius };
    activeTarget.current = target;
    setCursorTarget(target);
    if (isNewTarget) pulseCursor();

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

  const reveal = {
    animate: reduceMotion ? undefined : { y: 0 },
    initial: reduceMotion ? false : { y: "110%" },
    transition: { duration: 0.78, ease: revealEase },
  };

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
        stretched={cursorStretched}
        target={cursorTarget}
        visible={cursorVisible && !reduceMotion}
        height={cursorHeight}
        radius={cursorRadius}
        width={cursorWidth}
        x={cursorX}
        y={cursorY}
      />
      <PersonalHeader
        cursorHandlers={cursorHandlers}
        onWorkPreviewChange={setWorkPreviewVisible}
      />

      <section className="personal-frame" aria-labelledby="personal-title">
        <SignatureMark />
        <WorkPreview visible={workPreviewVisible} />
        <div className="personal-hero">
          <motion.div
            className="personal-copy"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.66, ease: revealEase }}
          >
            <p className="personal-kicker font-mono">
              <span className="reveal-clip">
                <motion.span className="reveal-block" {...reveal}>
                  design / code / products
                </motion.span>
              </span>
            </p>
            <h1 id="personal-title" className="personal-title">
              <span className="reveal-clip">
                <motion.span className="reveal-block" {...reveal} transition={{ duration: 0.92, ease: revealEase }}>
                  I design and build small, useful products with a focus on feel.
                </motion.span>
              </span>
            </h1>
            <p className="personal-intro">
              <span className="reveal-clip">
                <motion.span
                  className="reveal-block"
                  {...reveal}
                  transition={{ delay: 0.08, duration: 0.78, ease: revealEase }}
                >
                  Currently building Pinio, plus small experiments through guba.studio{" "}
                  <span className="smile-mark" aria-hidden="true">
                    :)
                  </span>
                </motion.span>
              </span>
            </p>
          </motion.div>
        </div>

        <footer className="personal-footer">
          <a
            className="cursor-link"
            href={contactHref}
            {...cursorHandlers(8, 22)}
          >
            hello@guba.studio
          </a>
          <span>Barcelona</span>
        </footer>
      </section>
    </main>
  );
}

function PersonalHeader({
  cursorHandlers,
  onWorkPreviewChange,
}: {
  cursorHandlers: (padding?: number, radius?: number) => {
    onPointerEnter: (event: PointerEvent<HTMLElement>) => void;
    onPointerLeave: (event: PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  };
  onWorkPreviewChange: (visible: boolean) => void;
}) {
  const workHandlers = cursorHandlers(8, 22);

  return (
    <header className="site-header fixed inset-x-0 top-0 z-40 flex items-start justify-between gap-6 px-5 py-5 text-[0.78rem] leading-relaxed md:px-10 md:py-7 md:text-[0.9rem]">
      <Link
        className="cursor-link w-max"
        href="/"
        {...cursorHandlers(8, 22)}
        aria-label="Adrian Gruber home"
      >
        Adrian Gruber
      </Link>
      <nav className="flex justify-end gap-6 md:gap-12" aria-label="Primary navigation">
        <Link
          className="cursor-link"
          href={workHref}
          onPointerEnter={(event) => {
            onWorkPreviewChange(true);
            workHandlers.onPointerEnter(event);
          }}
          onPointerLeave={(event) => {
            onWorkPreviewChange(false);
            workHandlers.onPointerLeave(event);
          }}
          onPointerMove={(event) => {
            onWorkPreviewChange(true);
            workHandlers.onPointerMove(event);
          }}
        >
          work
        </Link>
        <a
          className="cursor-link"
          href={contactHref}
          {...cursorHandlers(8, 22)}
        >
          contact
        </a>
      </nav>
    </header>
  );
}

const signatureDots = Array.from({ length: 84 }, (_, index) => {
  const col = index % 12;
  const row = Math.floor(index / 12);
  const distance = Math.abs(col - 5.5) + Math.abs(row - 3);
  const active = (row + col * 2) % 5 === 0 || (row === 3 && col > 2 && col < 9);

  return {
    active,
    index,
    opacity: active ? Math.max(0.22, 0.58 - distance * 0.055) : Math.max(0.06, 0.2 - distance * 0.02),
  };
});

function SignatureMark() {
  return (
    <span className="signature-dots" aria-hidden="true">
      {signatureDots.map((dot) => (
        <span
          className={dot.active ? "is-active" : undefined}
          key={dot.index}
          style={{ "--dot-opacity": dot.opacity } as CSSProperties}
        />
      ))}
    </span>
  );
}

function WorkPreview({ visible }: { visible: boolean }) {
  return (
    <motion.div
      className="work-peek"
      aria-hidden={!visible}
      initial={false}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 8, scale: 0.985 }}
      transition={{ duration: 0.28, ease: revealEase }}
    >
      <span>Pinio</span>
      <span>AI link organizer</span>
      <span>2026</span>
    </motion.div>
  );
}

function PersonalCursor({
  height,
  pressed,
  radius,
  stretched,
  target,
  visible,
  width,
  x,
  y,
}: {
  height: MotionValue<number>;
  pressed: boolean;
  radius: MotionValue<number>;
  stretched: boolean;
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
      animate={{
        opacity: visible ? 1 : 0,
        scale: pressed ? 0.97 : 1,
        scaleX: stretched ? 1.08 : 1,
        scaleY: stretched ? 0.96 : 1,
      }}
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
