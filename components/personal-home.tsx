"use client";

import Link from "next/link";
import { frame, motion, useSpring } from "motion/react";
import type { MotionStyle } from "motion/react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useClientReducedMotion } from "@/components/use-client-reduced-motion";

const contactHref = "mailto:hello@adriangruber.com";
const githubHref = "https://github.com/thegruber";
const linkedinHref = "https://www.linkedin.com/in/adrian-gruber";
const workHref = "/work";
const cursorSize = 10;
const cursorTargetPadding = 9;
const cursorTargetRadius = 21;
const cursorBaseFill = "#000000";
const cursorSpring = { damping: 30, stiffness: 620, mass: 0.55 };
const revealEase = [0.22, 1, 0.36, 1] as const;

type CursorTarget = {
  element: HTMLElement;
  fill: string;
  padding: number;
  radius: number;
  text: string;
};

type CursorHandlers = {
  onPointerEnter: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerLeave: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
};

export function PersonalHome() {
  const reduceMotion = useClientReducedMotion();
  const [cursorTarget, setCursorTarget] = useState<CursorTarget | null>(null);
  const [cursorFill, setCursorFill] = useState(cursorBaseFill);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorPressed, setCursorPressed] = useState(false);
  const activeTarget = useRef<CursorTarget | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("home-scroll-locked");
    window.scrollTo(0, 0);

    return () => {
      document.documentElement.classList.remove("home-scroll-locked");
    };
  }, []);

  function handlePointerEnter() {
    setCursorVisible(true);
  }

  function handlePointerMove() {
    if (reduceMotion) return;

    setCursorVisible(true);
  }

  function setCursorAround(
    element: HTMLElement,
    padding = cursorTargetPadding,
    radius = cursorTargetRadius,
  ) {
    const style = window.getComputedStyle(element);
    const fill = style.getPropertyValue("--link-liquid-fill").trim() || cursorBaseFill;
    const text = style.getPropertyValue("--link-liquid-text").trim() || "var(--color-paper)";
    const previousTarget = activeTarget.current;
    const sameTarget =
      previousTarget?.element === element &&
      previousTarget.fill === fill &&
      previousTarget.padding === padding &&
      previousTarget.radius === radius &&
      previousTarget.text === text;
    const target = sameTarget ? previousTarget : { element, fill, padding, radius, text };
    activeTarget.current = target;
    if (!sameTarget) {
      setCursorTarget(target);
      setCursorFill(fill);
    }
  }

  function resetCursor() {
    activeTarget.current = null;
    setCursorTarget(null);
    setCursorFill(cursorBaseFill);
  }

  const cursorHandlers = (padding = cursorTargetPadding, radius = cursorTargetRadius): CursorHandlers => ({
    onPointerEnter: (event) => setCursorAround(event.currentTarget, padding, radius),
    onPointerLeave: () => resetCursor(),
    onPointerMove: (event) => setCursorAround(event.currentTarget, padding, radius),
  });

  const reveal = {
    animate: reduceMotion ? undefined : { y: 0 },
    initial: reduceMotion ? false : { y: "110%" },
    transition: { duration: 0.78, ease: revealEase },
  };

  return (
    <main
      className="home-canvas personal-canvas bg-paper text-ink"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={() => {
        setCursorVisible(false);
        resetCursor();
      }}
      onPointerMove={handlePointerMove}
      onPointerDown={() => setCursorPressed(true)}
      onPointerUp={() => setCursorPressed(false)}
    >
      <PersonalCursor
        fill={cursorFill}
        pressed={cursorPressed}
        target={cursorTarget}
        visible={cursorVisible && !reduceMotion}
      />
      <PersonalHeader cursorHandlers={cursorHandlers} />

      <section className="personal-frame" aria-labelledby="personal-title">
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
            <motion.h1
              id="personal-title"
              className="personal-title"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.03, duration: 0.84, ease: revealEase }}
            >
              I design and build products that look sharp, feel natural, and make sense.
            </motion.h1>
            <p className="personal-intro">
              <span className="reveal-clip">
                <motion.span
                  className="reveal-block"
                  {...reveal}
                  transition={{ delay: 0.08, duration: 0.78, ease: revealEase }}
                >
                  UX/UI, frontend, product systems, and useful automation. Based in Europe.
                </motion.span>
              </span>
            </p>
          </motion.div>
        </div>

        <footer className="personal-footer">
          <nav className="personal-socials" aria-label="Social links">
            <a
              className="cursor-link social-link social-link-github"
              href={githubHref}
              rel="noreferrer"
              target="_blank"
              {...cursorHandlers()}
            >
              github
            </a>
            <a
              className="cursor-link social-link social-link-linkedin"
              href={linkedinHref}
              rel="noreferrer"
              target="_blank"
              {...cursorHandlers()}
            >
              linkedin
            </a>
          </nav>
        </footer>
      </section>
    </main>
  );
}

function PersonalHeader({
  cursorHandlers,
}: {
  cursorHandlers: (padding?: number, radius?: number) => CursorHandlers;
}) {
  return (
    <header className="site-header fixed inset-x-0 top-0 z-40 flex items-start justify-between gap-6 px-5 py-5 text-[0.78rem] leading-relaxed md:px-10 md:py-7 md:text-[0.9rem]">
      <Link
        className="cursor-link w-max"
        href="/"
        aria-label="Adrian Gruber home"
        {...cursorHandlers()}
      >
        Adrian Gruber
      </Link>
      <nav className="flex justify-end gap-6 md:gap-12" aria-label="Primary navigation">
        <Link
          className="cursor-link"
          href={workHref}
          prefetch={false}
          {...cursorHandlers()}
        >
          work
        </Link>
        <a
          className="cursor-link"
          href={contactHref}
          {...cursorHandlers()}
        >
          contact
        </a>
      </nav>
    </header>
  );
}

function PersonalCursor({
  fill,
  pressed,
  target,
  visible,
}: {
  fill: string;
  pressed: boolean;
  target: CursorTarget | null;
  visible: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { x, y, width, height, radius } = useFollowCursor(ref, target);
  const hasTarget = Boolean(target);
  const cursorFill = fill;
  const cursorStyle: MotionStyle = {
    backgroundColor: cursorFill,
    borderRadius: radius,
    height: height,
    width: width,
    x: x,
    y: y,
  };

  return (
    <motion.div
      ref={ref}
      className={`soft-cursor${hasTarget ? " is-target" : ""}${pressed ? " is-pressed" : ""}`}
      aria-hidden="true"
      animate={{
        opacity: visible ? 1 : 0,
        scale: pressed ? (hasTarget ? 0.985 : 0.84) : 1,
      }}
      style={cursorStyle}
      transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

function useFollowCursor(ref: RefObject<HTMLDivElement | null>, target: CursorTarget | null) {
  const x = useSpring(-80, cursorSpring);
  const y = useSpring(-80, cursorSpring);
  const width = useSpring(cursorSize, cursorSpring);
  const height = useSpring(cursorSize, cursorSpring);
  const radius = useSpring(999, cursorSpring);
  const targetRef = useRef(target);
  const latestPointer = useRef({ x: -80, y: -80 });

  const updateCursor = useCallback(
    (clientX: number, clientY: number) => {
      const element = ref.current;
      if (!element) return;

      frame.read(() => {
        const target = targetRef.current;

        if (target) {
          const rect = target.element.getBoundingClientRect();
          const targetWidth = rect.width + target.padding * 2;
          const targetHeight = rect.height + target.padding * 2;
          const targetX = rect.left + rect.width / 2;
          const targetY = rect.top + rect.height / 2;

          width.set(targetWidth);
          height.set(targetHeight);
          radius.set(target.radius);
          x.set(targetX - element.offsetLeft - targetWidth / 2);
          y.set(targetY - element.offsetTop - targetHeight / 2);
          return;
        }

        width.set(cursorSize);
        height.set(cursorSize);
        radius.set(999);
        x.set(clientX - element.offsetLeft - cursorSize / 2);
        y.set(clientY - element.offsetTop - cursorSize / 2);
      });
    },
    [height, radius, ref, width, x, y],
  );

  useEffect(() => {
    targetRef.current = target;
    updateCursor(latestPointer.current.x, latestPointer.current.y);
  }, [target, updateCursor]);

  useEffect(() => {
    const handlePointerMove = ({ clientX, clientY }: PointerEvent) => {
      latestPointer.current = { x: clientX, y: clientY };
      updateCursor(clientX, clientY);
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [updateCursor]);

  return { x, y, width, height, radius };
}
