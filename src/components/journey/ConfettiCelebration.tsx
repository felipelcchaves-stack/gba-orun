import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

const CONFETTI_COLORS = [
  "hsl(45, 100%, 50%)",   // gold
  "hsl(120, 60%, 35%)",   // leaf green
  "hsl(30, 60%, 35%)",    // earth brown
  "hsl(280, 60%, 45%)",   // purple
  "hsl(15, 90%, 55%)",    // orange
  "hsl(45, 100%, 70%)",   // light gold
];

const PARTICLE_COUNT = 28;

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  shape: "circle" | "rect" | "star";
  delay: number;
}

const ConfettiCelebration = ({ show }: { show: boolean }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: -(Math.random() * 120 + 40),
      rotation: Math.random() * 720 - 360,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: Math.random() * 6 + 4,
      shape: (["circle", "rect", "star"] as const)[Math.floor(Math.random() * 3)],
      delay: Math.random() * 0.3,
    }))
  , []);

  return (
    <AnimatePresence>
      {visible && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                opacity: 1,
                x: "50%",
                y: "50%",
                scale: 0,
                rotate: 0,
              }}
              animate={{
                opacity: [1, 1, 0],
                x: `calc(50% + ${p.x}px)`,
                y: `calc(50% + ${p.y}px)`,
                scale: [0, 1.2, 0.8],
                rotate: p.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.8,
                delay: p.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{
                position: "absolute",
                width: p.size,
                height: p.shape === "rect" ? p.size * 1.6 : p.size,
                backgroundColor: p.color,
                borderRadius: p.shape === "circle" ? "50%" : p.shape === "rect" ? "1px" : "0",
                clipPath: p.shape === "star" ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" : undefined,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfettiCelebration;
