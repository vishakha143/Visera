import { motion } from "framer-motion";

const NOISE_DATA_URI =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='3'/></filter><rect width='180' height='180' filter='url(%23n)' opacity='0.9'/></svg>\")";

export function DarkPanel({
  className = "",
  children,
  glow = true,
  radius = "rounded-[32px]",
}) {
  return (
    <div className={`relative overflow-hidden isolate ${radius} ${className}`}>
      {/* Graphite base — no green */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(140deg, #1c1917 0%, #292524 38%, #18181b 72%, #0c0c0b 100%)",
        }}
      />

      {glow && (
        <>
          {/* Warm amber highlight */}
          <motion.div
            className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(217,119,6,0.28) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
            animate={{ x: [0, 30, 0], y: [0, 20, 0], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Soft stone glow */}
          <motion.div
            className="absolute -bottom-40 -left-32 w-[460px] h-[460px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(68,64,60,0.5) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
            animate={{ x: [0, -25, 0], y: [0, -30, 0], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)",
          backgroundSize: "200% 200%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      />

      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: NOISE_DATA_URI }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 120px 20px rgba(0,0,0,0.35)" }}
      />

      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}