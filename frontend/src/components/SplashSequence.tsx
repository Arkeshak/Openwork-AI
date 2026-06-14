"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashSequence() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Check if we already showed the splash this session
    if (typeof window !== "undefined") {
      const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
      if (hasSeenSplash) {
        setShow(false);
      } else {
        sessionStorage.setItem("hasSeenSplash", "true");
        // Auto-hide after sequence
        const t = setTimeout(() => setShow(false), 4500);
        return () => clearTimeout(t);
      }
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ y: 0 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--bg)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Grain overlay for premium texture */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
              backgroundSize: "300px 300px",
              opacity: 0.05,
              pointerEvents: "none",
            }}
          />

          {/* Logo container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, zIndex: 2 }}
          >
            {/* Animated Logo Mark */}
            <motion.div
              initial={{ rotate: -90 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 64,
                height: 64,
                background: "var(--amber)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 60px rgba(240, 165, 32, 0.2)",
              }}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "40%" }}
                transition={{ delay: 0.5, duration: 0.6, ease: "anticipate" }}
                style={{ width: "10%", background: "var(--ink)" }}
              />
            </motion.div>

            {/* Text Content */}
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "clamp(3rem, 6vw, 4.5rem)",
                  textTransform: "uppercase",
                  letterSpacing: "-0.03em",
                  color: "var(--cream)",
                  lineHeight: 0.9,
                }}
              >
                OpenWork AI
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.25em",
                  color: "var(--amber)",
                  marginBottom: 16,
                }}
              >
                Intelligent Archives
              </motion.p>

              <motion.p
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: 1.6, duration: 1 }}
                style={{
                  color: "var(--mist)",
                  fontSize: "var(--text-sm)",
                  fontStyle: "italic",
                  maxWidth: 320,
                  margin: "0 auto",
                  lineHeight: 1.6,
                }}
              >
                Transforming documents into a conversational knowledge base.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 0.8, ease: "easeOut" }}
                style={{
                  color: "var(--amber)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  marginTop: 32,
                  textTransform: "uppercase",
                  opacity: 0.8,
                }}
              >
                Developed by @arkeshak
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
