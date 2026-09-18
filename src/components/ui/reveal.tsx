"use client";
import { motion, useReducedMotion } from "framer-motion";
export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) { const reduced = useReducedMotion(); return <motion.div className={className} initial={false} whileInView={reduced ? {} : { y: [12, 0], opacity: [0.75, 1] }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>; }
