"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * What happens between one page and the next.
 *
 * A short rise and fade, and nothing else. Anything longer than about
 * a third of a second stops feeling like a transition and starts
 * feeling like a wait, and the whole point of a page that loads this
 * fast is that it should never feel like a wait.
 *
 * This file re-mounts on every navigation, which is exactly what makes
 * it work, and also why nothing stateful can live here.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
