"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useClientReducedMotion } from "@/components/use-client-reduced-motion";

const heroAscii = [
  "+----------------+",
  "| guba.studio    |",
  "|                |",
  "| useful digital |",
  "| products    :) |",
  "+----------------+",
].join("\n");

export function SignalBoard() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useClientReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [28, -28]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0.45, -0.45]);

  return (
    <motion.div
      ref={ref}
      className="signal-board"
      aria-hidden="true"
      style={reduceMotion ? undefined : { y, rotate }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="ascii-panel-meta">
        <span>home</span>
        <span>2026</span>
      </div>
      <pre>{heroAscii}</pre>
      <div className="ascii-panel-meta">
        <span>Pinio</span>
        <span className="text-accent">:)</span>
      </div>
    </motion.div>
  );
}
