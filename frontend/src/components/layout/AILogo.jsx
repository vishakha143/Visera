import { motion } from "framer-motion";

const AILogo = () => {
  return (
    <div
      className="relative h-12 w-12 flex items-center justify-center"
      aria-label="VISERA"
    >
      {/* Soft warm glow */}
      <motion.div
        className="absolute -inset-1 rounded-[18px]"
        style={{
          background:
            "radial-gradient(circle, var(--accent) 0%, transparent 68%)",
          filter: "blur(9px)",
        }}
        animate={{ opacity: [0.3, 0.65, 0.3], scale: [0.92, 1.05, 0.92] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Outer rotating ring */}
      <div className="absolute inset-0 rounded-[14px] overflow-hidden">
        <motion.div
          className="absolute -inset-1/2"
          style={{
            background:
              "conic-gradient(from 0deg, #92400E, #D97706, #FBBF24, #D97706, #92400E)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Inner surface */}
      <div className="relative h-[38px] w-[38px] rounded-[11px] bg-[var(--surface)] flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          {/* Outer eye curve */}
          <path
            d="M3 12s3.8-5.5 9-5.5S21 12 21 12s-3.8 5.5-9 5.5S3 12 3 12Z"
            stroke="var(--accent-strong)"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          {/* Iris */}
          <circle cx="12" cy="12" r="2.8" stroke="var(--accent)" strokeWidth="1.6" />
          {/* Horizon / new-era line through the pupil */}
          <path
            d="M7.5 12h9"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Tiny forward spark */}
          <circle cx="17.8" cy="8.2" r="1.1" fill="var(--accent)" />
        </svg>
      </div>
    </div>
  );
};

export default AILogo;