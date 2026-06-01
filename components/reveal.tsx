"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useClientReducedMotion } from "@/components/use-client-reduced-motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
  as?: "div" | "section" | "article";
};

export function Reveal({ children, className, delay = 0, id, as = "div" }: RevealProps) {
  const reduceMotion = useClientReducedMotion();
  const Component = as === "section" ? motion.section : as === "article" ? motion.article : motion.div;

  return (
    <Component
      id={id}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 34, clipPath: "inset(0 0 18% 0)" }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.82, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}
