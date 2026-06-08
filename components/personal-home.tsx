"use client";

import { usePathname } from "next/navigation";
import { animate, frame, motion, useMotionValue, useSpring } from "motion/react";
import type { HTMLMotionProps, MotionStyle } from "motion/react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useClientReducedMotion } from "@/components/use-client-reduced-motion";

const contactHref = "mailto:hello@adriangruber.com";
const githubHref = "https://github.com/thegruber";
const linkedinHref = "https://www.linkedin.com/in/adrian-gruber";
const feelWords = [
  "clear",
  "useful",
  "precise",
  "reliable",
  "alive",
  "natural",
  "human",
  "adaptive",
] as const;
const cursorSize = 10;
const cursorTargetPadding = 0;
const cursorTargetRadius = 21;
const cursorTextMaxWidth = cursorSize;
const cursorTextMinWidth = 3;
const cursorBaseFill = "#050505";
const cursorTextFill = "#245cff";
const cursorSpring = { damping: 30, stiffness: 620, mass: 0.55 };
const cursorTargetSnapDuration = 360;
const scrambleRevealCharacters = "abcdefghijklmnopqrstuvwxyz";
const scrambleRevealDuration = 520;
const terminalWordInitialDelay = 2600;
const terminalWordHoldDuration = 4200;
const terminalWordExitDuration = 240;
const terminalWordEnterDuration = 680;
const terminalWordResolveDuration = 520;
const terminalWordResolveStepDuration = 74;
const terminalResolveCharacters = "abcdefghijklmnopqrstuvwxyz";
const startupCountDuration = 1500;
const startupCompleteDelay = 80;
const startupCompleteHoldDuration = 320;
const startupCursorSize = 72;
const startupShrinkDuration = 520;
const startupDigitFadeDuration = 260;
const revealDelays = {
  frame: 180,
  titleStart: 580,
  titleMiddle: 760,
  titleEnd: 930,
  adjective: 1120,
  meta: 1360,
} as const;
const revealEase = [0.22, 1, 0.36, 1] as const;

type CursorTarget = {
  element: HTMLElement;
  fill: string;
  padding: number;
  radius: number;
  text: string;
};

type CursorTextTarget = {
  element: HTMLElement;
  lineHeight: number;
};

type CursorHoverHandlers = {
  onPointerEnter: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerLeave: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
};

type CursorPointerHandlers = CursorHoverHandlers & {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
};

type CursorHandlers = CursorPointerHandlers & {
  draggable: false;
  onClick: (event: ReactMouseEvent<HTMLElement>) => void;
  onManualDragEnd: (
    element: HTMLElement,
    point: { x: number; y: number },
  ) => void;
  onManualDragStart: () => void;
  onPointerRelease: () => void;
};

type TerminalWordPhase = "idle" | "exiting" | "entering";

export function PersonalHome() {
  const pathname = usePathname();
  const reduceMotion = useClientReducedMotion();
  const [cursorTarget, setCursorTarget] = useState<CursorTarget | null>(null);
  const [cursorTextTarget, setCursorTextTarget] = useState<CursorTextTarget | null>(null);
  const [cursorFill, setCursorFill] = useState(cursorBaseFill);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorPressed, setCursorPressed] = useState(false);
  const [cursorDragging, setCursorDragging] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [introRevealing, setIntroRevealing] = useState(false);
  const activeTarget = useRef<CursorTarget | null>(null);
  const activeTextTarget = useRef<CursorTextTarget | null>(null);
  const targetGestureActiveRef = useRef(false);
  const targetDragActiveRef = useRef(false);
  const releaseResetTimeout = useRef(0);
  const suppressClickRef = useRef(false);
  const contentVisible = reduceMotion || introRevealing;
  const interactionsEnabled = reduceMotion || introComplete;
  const introActive = !interactionsEnabled;
  const revealKey = `${pathname}:${contentVisible ? "visible" : "hidden"}`;
  const handleIntroComplete = useCallback(() => {
    setCursorVisible(true);
    setIntroComplete(true);
  }, []);
  const handleIntroReveal = useCallback(() => {
    setIntroRevealing(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("home-scroll-locked");
    window.scrollTo(0, 0);

    return () => {
      document.documentElement.classList.remove("home-scroll-locked");
      window.clearTimeout(releaseResetTimeout.current);
    };
  }, []);

  function handlePointerEnter() {
    if (introActive || reduceMotion) return;

    setCursorVisible(true);
  }

  function handlePointerMove() {
    if (introActive || reduceMotion) return;

    setCursorVisible(true);
  }

  function setCursorAround(
    element: HTMLElement,
    padding = cursorTargetPadding,
    radius = cursorTargetRadius,
  ) {
    if (introActive) return;

    window.clearTimeout(releaseResetTimeout.current);
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
    activeTextTarget.current = null;
    if (!sameTarget) {
      setCursorTarget(target);
      setCursorTextTarget(null);
      setCursorFill(fill);
    }
  }

  function resetCursor() {
    if (targetGestureActiveRef.current) return;

    window.clearTimeout(releaseResetTimeout.current);
    activeTarget.current = null;
    setCursorTarget(null);
    setCursorFill(cursorBaseFill);
  }

  function setCursorForText(element: HTMLElement, clientX: number, clientY: number) {
    if (introActive) return;

    const line = getTextCursorLineMetrics(element, clientX, clientY);

    if (!line) {
      resetTextCursor();
      return;
    }

    const lineHeight = getTextCursorLineHeight(element);
    const previousTarget = activeTextTarget.current;
    const sameTarget =
      previousTarget?.element === element && previousTarget.lineHeight === lineHeight;
    const target = sameTarget ? previousTarget : { element, lineHeight };

    activeTextTarget.current = target;
    activeTarget.current = null;

    if (!sameTarget) {
      setCursorTarget(null);
      setCursorTextTarget(target);
      setCursorFill(cursorTextFill);
    }
  }

  function resetTextCursor() {
    activeTextTarget.current = null;
    setCursorTextTarget(null);
    if (!activeTarget.current) {
      setCursorFill(cursorBaseFill);
    }
  }

  function handlePointerDown() {
    setCursorPressed(true);
  }

  function handleTargetPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (introActive || reduceMotion) return;

    targetGestureActiveRef.current = true;
    setCursorAround(event.currentTarget);
    setCursorVisible(true);
    setCursorPressed(true);
  }

  function handleTargetDragStart() {
    targetDragActiveRef.current = true;
    suppressClickRef.current = true;
    setCursorDragging(true);
    setCursorPressed(true);
  }

  function handleTargetDragEnd(element: HTMLElement, point: { x: number; y: number }) {
    setCursorPressed(false);
    setCursorDragging(false);
    targetDragActiveRef.current = false;
    targetGestureActiveRef.current = false;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 180);

    const releasedTarget = activeTarget.current?.element ?? element;

    if (!isPointInsideElement(releasedTarget, point.x, point.y)) {
      releaseResetTimeout.current = window.setTimeout(() => {
        if (activeTarget.current?.element === releasedTarget) {
          resetCursor();
        }
      }, cursorTargetSnapDuration);
    }
  }

  function handleTargetClick(event: ReactMouseEvent<HTMLElement>) {
    if (!suppressClickRef.current) return;

    suppressClickRef.current = false;
    event.preventDefault();
  }

  function handleTargetPointerRelease() {
    setCursorPressed(false);
    if (!targetDragActiveRef.current) {
      targetGestureActiveRef.current = false;
    }
  }

  const cursorHandlers = (padding = cursorTargetPadding, radius = cursorTargetRadius): CursorHandlers => ({
    draggable: false,
    onClick: handleTargetClick,
    onManualDragEnd: handleTargetDragEnd,
    onManualDragStart: handleTargetDragStart,
    onPointerDown: handleTargetPointerDown,
    onPointerEnter: (event) => setCursorAround(event.currentTarget, padding, radius),
    onPointerLeave: () => resetCursor(),
    onPointerMove: (event) => setCursorAround(event.currentTarget, padding, radius),
    onPointerRelease: handleTargetPointerRelease,
  });

  const textCursorHandlers: CursorHoverHandlers = {
    onPointerEnter: (event) => setCursorForText(event.currentTarget, event.clientX, event.clientY),
    onPointerLeave: () => resetTextCursor(),
    onPointerMove: (event) => setCursorForText(event.currentTarget, event.clientX, event.clientY),
  };

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
        if (targetGestureActiveRef.current) return;

        setCursorVisible(false);
        resetCursor();
        resetTextCursor();
      }}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={() => {
        setCursorPressed(false);
        if (!targetDragActiveRef.current) {
          targetGestureActiveRef.current = false;
        }
      }}
      onPointerCancel={() => {
        targetDragActiveRef.current = false;
        targetGestureActiveRef.current = false;
        setCursorDragging(false);
        setCursorPressed(false);
      }}
    >
      <PersonalCursor
        dragging={cursorDragging}
        fill={cursorFill}
        pressed={cursorPressed}
        target={cursorTarget}
        textTarget={cursorTextTarget}
        visible={cursorVisible && !introActive && !reduceMotion}
      />
      {!introComplete ? (
        <StartupCursor
          disabled={reduceMotion}
          onComplete={handleIntroComplete}
          onReveal={handleIntroReveal}
        />
      ) : null}
      <PersonalHeader
        cursorHandlers={cursorHandlers}
        interactive={interactionsEnabled}
        revealKey={revealKey}
        reduceMotion={reduceMotion}
        visible={contentVisible}
      />

      <section className="personal-frame" aria-labelledby="personal-title">
        <div className="personal-hero">
          <motion.div
            className="personal-copy"
            initial={false}
            animate={contentVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ duration: 0.66, ease: revealEase }}
          >
            <motion.h1
              id="personal-title"
              className="personal-title"
              aria-label="i build software that feels clear"
              initial={false}
              animate={contentVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              transition={{ delay: msToSeconds(revealDelays.titleStart), duration: 0.84, ease: revealEase }}
            >
              <span
                className="headline-line text-cursor-zone"
                data-cursor-text
                {...textCursorHandlers}
              >
                <motion.span
                  className="headline-build-part"
                  initial={false}
                  animate={contentVisible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: msToSeconds(revealDelays.titleStart), duration: 0.42, ease: revealEase }}
                >
                  <ScrambleRevealText
                    active={contentVisible}
                    delay={revealDelays.titleStart}
                    disabled={reduceMotion}
                    revealKey={revealKey}
                    text="i build"
                  />
                </motion.span>
              </span>
              <span
                className="headline-line text-cursor-zone"
                data-cursor-text
                {...textCursorHandlers}
              >
                <motion.span
                  className="headline-build-part"
                  initial={false}
                  animate={contentVisible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: msToSeconds(revealDelays.titleMiddle), duration: 0.42, ease: revealEase }}
                >
                  <ScrambleRevealText
                    active={contentVisible}
                    delay={revealDelays.titleMiddle}
                    disabled={reduceMotion}
                    revealKey={revealKey}
                    text="software"
                  />
                </motion.span>
              </span>
              <span
                className="headline-line text-cursor-zone"
                data-cursor-text
                {...textCursorHandlers}
              >
                <motion.span
                  className="headline-build-part"
                  initial={false}
                  animate={contentVisible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: msToSeconds(revealDelays.titleEnd), duration: 0.42, ease: revealEase }}
                >
                  <ScrambleRevealText
                    active={contentVisible}
                    delay={revealDelays.titleEnd}
                    disabled={reduceMotion}
                    revealKey={revealKey}
                    text="that feels"
                  />
                </motion.span>
              </span>
              <span
                className="headline-line text-cursor-zone"
                data-cursor-text
                {...textCursorHandlers}
              >
                <motion.span
                  className="headline-build-part"
                  initial={false}
                  animate={contentVisible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: msToSeconds(revealDelays.adjective), duration: 0.42, ease: revealEase }}
                >
                  <TerminalWord
                    className="living-word"
                    disabled={reduceMotion || !contentVisible}
                    initialResolveDelay={revealDelays.adjective + 120}
                    startDelay={revealDelays.adjective + terminalWordInitialDelay}
                    texts={feelWords}
                  />
                </motion.span>
              </span>
            </motion.h1>
            <p className="personal-meta font-mono">
              <span className="reveal-clip">
                <motion.span
                  className="reveal-block"
                  {...reveal}
                  transition={{ delay: msToSeconds(revealDelays.meta), duration: 0.78, ease: revealEase }}
                >
                  <span className="text-cursor-zone" data-cursor-text {...textCursorHandlers}>
                    <ScrambleRevealText
                      active={contentVisible}
                      delay={revealDelays.meta}
                      disabled={reduceMotion}
                      revealKey={revealKey}
                      text="software engineer"
                    />
                  </span>
                </motion.span>
              </span>
            </p>
          </motion.div>
        </div>

        <motion.footer
          className="personal-footer"
          initial={false}
          animate={contentVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          style={{ pointerEvents: interactionsEnabled ? "auto" : "none" }}
          transition={{ delay: contentVisible ? msToSeconds(revealDelays.frame) : 0, duration: 0.52, ease: revealEase }}
        >
          <nav className="personal-socials" aria-label="Social links">
            <CursorLink
              className="cursor-link social-link social-link-github"
              cursorHandlers={cursorHandlers}
              href={githubHref}
              label="GitHub"
              rel="noreferrer"
              target="_blank"
            >
              <ScrambleRevealText
                active={contentVisible}
                delay={revealDelays.frame}
                disabled={reduceMotion}
                revealKey={revealKey}
                text="github"
              />
            </CursorLink>
            <CursorLink
              className="cursor-link social-link social-link-linkedin"
              cursorHandlers={cursorHandlers}
              href={linkedinHref}
              label="LinkedIn"
              rel="noreferrer"
              target="_blank"
            >
              <ScrambleRevealText
                active={contentVisible}
                delay={revealDelays.frame}
                disabled={reduceMotion}
                revealKey={revealKey}
                text="linkedin"
              />
            </CursorLink>
          </nav>
        </motion.footer>
      </section>
    </main>
  );
}

function PersonalHeader({
  cursorHandlers,
  interactive,
  reduceMotion,
  revealKey,
  visible,
}: {
  cursorHandlers: (padding?: number, radius?: number) => CursorHandlers;
  interactive: boolean;
  reduceMotion: boolean;
  revealKey: string;
  visible: boolean;
}) {
  return (
    <motion.header
      className="site-header fixed inset-x-0 top-0 z-40 flex items-start justify-between gap-6 text-[0.78rem] leading-relaxed md:text-[0.9rem]"
      initial={false}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
      style={{ pointerEvents: interactive ? "auto" : "none" }}
      transition={{ delay: visible ? msToSeconds(revealDelays.frame) : 0, duration: 0.52, ease: revealEase }}
    >
      <CursorLink
        className="cursor-link w-max"
        cursorHandlers={cursorHandlers}
        href="/"
        label="Adrian Gruber home"
      >
        <ScrambleRevealText
          active={visible}
          delay={revealDelays.frame}
          disabled={reduceMotion}
          revealKey={revealKey}
          text="adrian gruber"
        />
      </CursorLink>
      <nav className="flex justify-end gap-6 md:gap-12" aria-label="Primary navigation">
        <CursorLink
          className="cursor-link"
          cursorHandlers={cursorHandlers}
          href={contactHref}
          label="Contact"
        >
          <ScrambleRevealText
            active={visible}
            delay={revealDelays.frame}
            disabled={reduceMotion}
            revealKey={revealKey}
            text="contact"
          />
        </CursorLink>
      </nav>
    </motion.header>
  );
}

function CursorLink({
  children,
  className,
  cursorHandlers,
  href,
  label,
  rel,
  target,
}: {
  children: ReactNode;
  className: string;
  cursorHandlers: (padding?: number, radius?: number) => CursorHandlers;
  href: string;
  label: string;
  rel?: string;
  target?: HTMLMotionProps<"a">["target"];
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [dragging, setDragging] = useState(false);
  const activeDragRef = useRef<{
    dragging: boolean;
    element: HTMLElement;
    startX: number;
    startY: number;
  } | null>(null);
  const cleanupDragRef = useRef<() => void>(() => undefined);
  const returnAnimationsRef = useRef<Array<{ stop: () => void }>>([]);
  const handlers = cursorHandlers();

  useEffect(() => {
    return () => {
      cleanupDragRef.current();
      stopReturnAnimations();
    };
  }, []);

  function stopReturnAnimations() {
    for (const animation of returnAnimationsRef.current) {
      animation.stop();
    }

    returnAnimationsRef.current = [];
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0) return;

    stopReturnAnimations();
    handlers.onPointerDown(event);

    const element = event.currentTarget;
    activeDragRef.current = {
      dragging: false,
      element,
      startX: event.clientX,
      startY: event.clientY,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const drag = activeDragRef.current;
      if (!drag) return;

      const deltaX = moveEvent.clientX - drag.startX;
      const deltaY = moveEvent.clientY - drag.startY;

      if (!drag.dragging) {
        const distance = Math.hypot(deltaX, deltaY);
        if (distance < 2) return;

        drag.dragging = true;
        setDragging(true);
        handlers.onManualDragStart();
      }

      moveEvent.preventDefault();
      x.set(deltaX);
      y.set(deltaY);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      const drag = activeDragRef.current;

      cleanupDragRef.current();
      activeDragRef.current = null;
      handlers.onPointerRelease();

      if (!drag?.dragging) {
        x.set(0);
        y.set(0);
        return;
      }

      setDragging(false);
      returnAnimationsRef.current = [
        animate(x, 0, { type: "spring", stiffness: 520, damping: 22 }),
        animate(y, 0, { type: "spring", stiffness: 520, damping: 22 }),
      ];
      handlers.onManualDragEnd(drag.element, {
        x: upEvent.clientX,
        y: upEvent.clientY,
      });
    };

    cleanupDragRef.current();
    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    cleanupDragRef.current = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      cleanupDragRef.current = () => undefined;
    };
  }

  return (
    <motion.a
      className={className}
      href={href}
      aria-label={label}
      rel={rel}
      target={target}
      animate={{ scale: dragging ? 1.035 : 1 }}
      draggable={false}
      onClick={handlers.onClick}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlers.onPointerEnter}
      onPointerLeave={handlers.onPointerLeave}
      onPointerMove={handlers.onPointerMove}
      style={{ x, y }}
      transition={{ duration: 0.16, ease: revealEase }}
    >
      {children}
    </motion.a>
  );
}

function msToSeconds(milliseconds: number) {
  return milliseconds / 1000;
}

function StartupCursor({
  disabled,
  onComplete,
  onReveal,
}: {
  disabled: boolean;
  onComplete: () => void;
  onReveal: () => void;
}) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<"counting" | "complete" | "settling">("counting");
  const x = useSpring(0, cursorSpring);
  const y = useSpring(0, cursorSpring);

  useEffect(() => {
    if (disabled) return;

    const settleFrame = requestAnimationFrame(() => {
      x.set(window.innerWidth / 2);
      y.set(window.innerHeight / 2);
    });
    const handlePointerMove = ({ clientX, clientY }: PointerEvent) => {
      x.set(clientX);
      y.set(clientY);
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      cancelAnimationFrame(settleFrame);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [disabled, x, y]);

  useEffect(() => {
    if (disabled) {
      const settleFrame = requestAnimationFrame(() => {
        setCount(100);
        onReveal();
        onComplete();
      });

      return () => cancelAnimationFrame(settleFrame);
    }

    let frameId = 0;
    let completeDelayTimeout = 0;
    let settleTimeout = 0;
    let completeTimeout = 0;
    const start = performance.now();

    const update = (now: number) => {
      const rawProgress = Math.min((now - start) / startupCountDuration, 1);
      const easedProgress = 1 - Math.pow(1 - rawProgress, 3);

      setCount(Math.round(easedProgress * 100));

      if (rawProgress < 1) {
        frameId = requestAnimationFrame(update);
        return;
      }

      setCount(100);
      completeDelayTimeout = window.setTimeout(() => {
        setPhase("complete");
        settleTimeout = window.setTimeout(() => {
          setPhase("settling");
          onReveal();
          completeTimeout = window.setTimeout(() => {
            onComplete();
          }, startupShrinkDuration);
        }, startupCompleteHoldDuration);
      }, startupCompleteDelay);
    };

    frameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(completeDelayTimeout);
      window.clearTimeout(settleTimeout);
      window.clearTimeout(completeTimeout);
    };
  }, [disabled, onComplete, onReveal]);

  const settling = phase === "settling";
  const complete = phase === "complete";

  return (
    <motion.div
      className="startup-cursor"
      aria-hidden="true"
      style={{ x, y }}
    >
      <motion.div
        className="startup-cursor-dot"
        animate={{
          height: settling ? cursorSize : startupCursorSize,
          width: settling ? cursorSize : startupCursorSize,
        }}
        transition={{ type: "spring", stiffness: 520, damping: 30, mass: 0.6 }}
      >
        <motion.span
          className="startup-cursor-value font-mono"
          animate={{
            opacity: settling ? 0 : 1,
            scale: settling ? 0.92 : complete ? 1.04 : 1,
          }}
          transition={{ duration: startupDigitFadeDuration / 1000, ease: revealEase }}
        >
          {String(count).padStart(3, "0")}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

function ScrambleRevealText({
  active,
  className,
  delay = 0,
  disabled,
  revealKey,
  text,
}: {
  active: boolean;
  className?: string;
  delay?: number;
  disabled: boolean;
  revealKey: string;
  text: string;
}) {
  const [value, setValue] = useState("");
  const [visibleRevealKey, setVisibleRevealKey] = useState<string | null>(null);
  const segments = useMemo(() => getTextSegments(text), [text]);

  useEffect(() => {
    if (!active || disabled) {
      return;
    }

    let frameId = 0;
    let delayTimeout = 0;
    let lastUpdate = 0;
    let lastValue = "";

    delayTimeout = window.setTimeout(() => {
      const initialValue = scrambleRevealText(text, 0);
      const start = performance.now();
      lastValue = initialValue;
      setVisibleRevealKey(revealKey);
      setValue(initialValue);

      const update = (now: number) => {
        const progress = Math.min((now - start) / scrambleRevealDuration, 1);
        const nextValue = progress < 1 ? scrambleRevealText(text, progress) : text;

        if ((now - lastUpdate > 48 || progress === 1) && nextValue !== lastValue) {
          lastUpdate = now;
          lastValue = nextValue;
          setValue(nextValue);
        }

        if (progress < 1) {
          frameId = requestAnimationFrame(update);
        }
      };

      frameId = requestAnimationFrame(update);
    }, delay);

    return () => {
      window.clearTimeout(delayTimeout);
      cancelAnimationFrame(frameId);
    };
  }, [active, delay, disabled, revealKey, text]);

  const displayValue = disabled ? text : active && visibleRevealKey === revealKey ? value : "";

  return (
    <span className={className ? `scramble-reveal-text ${className}` : "scramble-reveal-text"} aria-hidden="true">
      {segments.map((segment) => {
        const visibleSegment = displayValue.slice(segment.start, segment.end);

        if (segment.type === "space") {
          return (
            <span className="scramble-space" key={segment.key}>
              {segment.text}
            </span>
          );
        }

        return (
          <span className="scramble-word-slot" key={segment.key}>
            <span className="scramble-measure">{segment.text}</span>
            <span className="scramble-value">{visibleSegment}</span>
          </span>
        );
      })}
    </span>
  );
}

function TerminalWord({
  className,
  disabled,
  initialResolveDelay = 0,
  startDelay = 0,
  texts,
}: {
  className?: string;
  disabled: boolean;
  initialResolveDelay?: number;
  startDelay?: number;
  texts: readonly [string, ...string[]];
}) {
  const [state, setState] = useState<{ phase: TerminalWordPhase; value: string }>({
    phase: "idle",
    value: texts[0],
  });
  const terminalWordMinWidth = `${Math.max(...texts.map((text) => text.length))}ch`;

  useEffect(() => {
    const shouldReduce =
      disabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (shouldReduce) {
      const settleFrame = requestAnimationFrame(() => {
        setState({ phase: "idle", value: texts[0] });
      });
      return () => cancelAnimationFrame(settleFrame);
    }

    const timeouts: number[] = [];
    let activeIndex = 0;

    const schedule = (callback: () => void, delay: number) => {
      const timeout = window.setTimeout(callback, delay);
      timeouts.push(timeout);
      return timeout;
    };

    const runResolveIn = (word: string, onComplete: () => void) => {
      const frames = getTerminalResolveFrames(word);
      const stepDuration = Math.max(
        terminalWordResolveStepDuration,
        terminalWordResolveDuration / Math.max(frames.length - 1, 1),
      );

      setState({ phase: "entering", value: frames[0] ?? word });
      frames.slice(1).forEach((value, index) => {
        schedule(() => {
          setState({ phase: "entering", value });
        }, Math.round((index + 1) * stepDuration));
      });
      schedule(onComplete, terminalWordEnterDuration);
    };

    const runTransition = () => {
      const currentWord = texts[activeIndex] ?? texts[0];
      const nextIndex = (activeIndex + 1) % texts.length;
      const nextWord = texts[nextIndex] ?? texts[0];

      setState({ phase: "exiting", value: currentWord });
      schedule(() => {
        activeIndex = nextIndex;
        runResolveIn(nextWord, () => {
          setState({ phase: "idle", value: nextWord });
          schedule(runTransition, terminalWordHoldDuration);
        });
      }, terminalWordExitDuration);
    };

    schedule(() => {
      runResolveIn(texts[0], () => {
        setState({ phase: "idle", value: texts[0] });
      });
    }, initialResolveDelay);
    schedule(runTransition, startDelay);

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [disabled, initialResolveDelay, startDelay, texts]);

  return (
    <span
      className={`terminal-word is-${state.phase}${className ? ` ${className}` : ""}`}
      style={{ minWidth: terminalWordMinWidth }}
      aria-hidden="true"
    >
      <span className="terminal-word-value">{state.value}</span>
    </span>
  );
}

function getTerminalResolveFrames(text: string) {
  const characters = Array.from(text);

  if (characters.length === 0) {
    return [text];
  }

  return characters.map((_, step) => getTerminalResolveValue(text, step));
}

function getTerminalResolveValue(text: string, step: number) {
  const characters = Array.from(text);

  if (characters.length === 0 || step >= characters.length - 1) {
    return text;
  }

  const visibleCount = Math.min(characters.length, Math.max(1, step + 1));
  const visibleCharacters = characters.slice(0, visibleCount);
  const activeIndex = visibleCharacters.length - 1;

  if (activeIndex > 0) {
    visibleCharacters[activeIndex] = getTerminalResolveCharacter(text, activeIndex, step);
  }

  return visibleCharacters.join("");
}

function getTerminalResolveCharacter(text: string, index: number, step: number) {
  const original = text[index] ?? "";

  if (!original) {
    return original;
  }

  const characterIndex = terminalResolveCharacters.indexOf(original.toLowerCase());
  const fallbackIndex = characterIndex >= 0 ? characterIndex + 1 : index + step;
  return terminalResolveCharacters[fallbackIndex % terminalResolveCharacters.length] ?? original;
}

function getTextSegments(text: string) {
  const segments: Array<{
    end: number;
    key: string;
    start: number;
    text: string;
    type: "space" | "word";
  }> = [];
  const matches = text.matchAll(/\s+|\S+/g);

  for (const match of matches) {
    const segmentText = match[0];
    const start = match.index ?? 0;

    segments.push({
      end: start + segmentText.length,
      key: `${start}:${segmentText}`,
      start,
      text: segmentText,
      type: /^\s+$/.test(segmentText) ? "space" : "word",
    });
  }

  return segments;
}

function scrambleRevealText(text: string, progress: number) {
  return Array.from(text)
    .map((char, index) => {
      if (char === " ") return char;

      const characterProgress = Math.min(
        Math.max((progress - index * 0.012) / 0.7, 0),
        1,
      );

      if (progress === 1 || characterProgress > 0.78) return char;
      if (Math.random() < characterProgress * 0.82) return char;

      return getCalmScrambleCharacter(char);
    })
    .join("");
}

function getCalmScrambleCharacter(char: string) {
  if (/[a-z]/.test(char)) {
    return scrambleRevealCharacters[Math.floor(Math.random() * scrambleRevealCharacters.length)];
  }

  if (/[A-Z]/.test(char)) {
    return scrambleRevealCharacters[
      Math.floor(Math.random() * scrambleRevealCharacters.length)
    ].toUpperCase();
  }

  return char;
}

function getTextCursorLineHeight(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  const fontSize = Number.parseFloat(style.fontSize);
  const lineHeight = Number.parseFloat(style.lineHeight);
  const fallbackHeight = Number.isFinite(fontSize) ? fontSize * 1.1 : 18;
  const textHeight = Number.isFinite(lineHeight) ? lineHeight : fallbackHeight;

  return Math.max(14, Math.round(textHeight));
}

function getTextCursorWidth(lineHeight: number) {
  return Math.max(
    cursorTextMinWidth,
    Math.min(cursorTextMaxWidth, Math.round(lineHeight * 0.1)),
  );
}

function getTextCursorVisualHeight(lineHeight: number) {
  return Math.max(12, Math.round(lineHeight * 0.92));
}

function getTextCursorLineMetrics(element: HTMLElement, clientX: number, clientY: number) {
  const rects = Array.from(element.getClientRects());
  const lineHeight = getTextCursorLineHeight(element);
  const hitRect = rects.find((rect) => {
    const verticalHit = clientY >= rect.top && clientY <= rect.bottom;
    const horizontalHit = clientX >= rect.left && clientX <= rect.right;

    return verticalHit && horizontalHit;
  });

  if (!hitRect) return null;

  return {
    height: getTextCursorVisualHeight(lineHeight),
    width: getTextCursorWidth(lineHeight),
    y: hitRect.top + hitRect.height / 2,
  };
}

function isPointInsideElement(element: HTMLElement, clientX: number, clientY: number) {
  const rect = element.getBoundingClientRect();

  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}

function PersonalCursor({
  dragging,
  fill,
  pressed,
  target,
  textTarget,
  visible,
}: {
  dragging: boolean;
  fill: string;
  pressed: boolean;
  target: CursorTarget | null;
  textTarget: CursorTextTarget | null;
  visible: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { x, y, width, height, radius } = useFollowCursor(
    ref,
    target,
    textTarget,
  );
  const hasTarget = Boolean(target);
  const hasTextTarget = Boolean(textTarget) && !hasTarget;
  const cursorFill = hasTextTarget ? cursorTextFill : fill;
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
      className={`soft-cursor${hasTarget ? " is-target" : ""}${hasTextTarget ? " is-text" : ""}${dragging ? " is-dragging" : ""}${pressed ? " is-pressed" : ""}`}
      aria-hidden="true"
      animate={{
        opacity: visible ? 1 : 0,
        scale: dragging ? 1.035 : pressed ? (hasTarget ? 0.985 : hasTextTarget ? 0.96 : 0.84) : 1,
      }}
      style={cursorStyle}
      transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

function useFollowCursor(
  ref: RefObject<HTMLDivElement | null>,
  target: CursorTarget | null,
  textTarget: CursorTextTarget | null,
) {
  const x = useSpring(-80, cursorSpring);
  const y = useSpring(-80, cursorSpring);
  const width = useSpring(cursorSize, cursorSpring);
  const height = useSpring(cursorSize, cursorSpring);
  const radius = useSpring(999, cursorSpring);
  const targetRef = useRef(target);
  const textTargetRef = useRef(textTarget);
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

        const textTarget = textTargetRef.current;

        if (textTarget) {
          const textLine = getTextCursorLineMetrics(textTarget.element, clientX, clientY);

          if (!textLine) {
            width.set(cursorSize);
            height.set(cursorSize);
            radius.set(999);
            x.set(clientX - element.offsetLeft - cursorSize / 2);
            y.set(clientY - element.offsetTop - cursorSize / 2);
            return;
          }

          width.set(textLine.width);
          height.set(textLine.height);
          radius.set(999);
          x.set(clientX - element.offsetLeft - textLine.width / 2);
          y.set(textLine.y - element.offsetTop - textLine.height / 2);
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
    textTargetRef.current = textTarget;
    updateCursor(latestPointer.current.x, latestPointer.current.y);
  }, [textTarget, updateCursor]);

  useEffect(() => {
    const handlePointerMove = ({ clientX, clientY }: PointerEvent) => {
      latestPointer.current = { x: clientX, y: clientY };
      updateCursor(clientX, clientY);
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [updateCursor]);

  useEffect(() => {
    if (!target) return;

    let frameId = 0;

    const syncTargetRect = () => {
      updateCursor(latestPointer.current.x, latestPointer.current.y);
      frameId = requestAnimationFrame(syncTargetRect);
    };

    frameId = requestAnimationFrame(syncTargetRect);

    return () => cancelAnimationFrame(frameId);
  }, [target, updateCursor]);

  return { x, y, width, height, radius };
}
