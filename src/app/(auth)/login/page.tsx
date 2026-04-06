"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "motion/react";
import { LanguageProvider, useLanguage } from "@/lib/i18n";

// Stagger container + item variants
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function ManzaraIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="1.5" y="1.5" width="9" height="9" rx="2" fill="white" opacity="0.95" />
      <rect x="12" y="1.5" width="6.5" height="4" rx="1.5" fill="white" opacity="0.55" />
      <rect x="12" y="7" width="6.5" height="3.5" rx="1.5" fill="white" opacity="0.35" />
      <rect x="1.5" y="12" width="7.5" height="6.5" rx="1.5" fill="white" opacity="0.45" />
      <rect x="10.5" y="12" width="8" height="6.5" rx="1.5" fill="white" opacity="0.25" />
    </svg>
  );
}

function Spinner() {
  return (
    <motion.span
      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
    />
  );
}

export default function LoginPage() {
  return (
    <LanguageProvider>
      <LoginForm />
    </LanguageProvider>
  );
}

function LoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("admin@manzara.uz");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError(t.login.error);
      setShakeKey((k) => k + 1);
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 40%, #312e81 0%, #1e1b4b 55%, #0f0d2e 100%)",
      }}
    >
      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo above card */}
        <motion.div variants={item} className="text-center mb-8">
          <motion.div
            className="inline-flex items-center gap-2.5 mb-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-900/60">
              <ManzaraIcon size={22} />
            </div>
            <span className="text-[28px] font-bold text-white tracking-tight leading-none">
              Manzara
            </span>
          </motion.div>
          <p className="text-indigo-300 text-sm font-medium">
            {t.login.tagline}
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={item}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-indigo-950/60 p-8 border border-white/20"
        >
          <motion.div variants={item}>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">
              {t.login.welcome}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {t.login.subtitle}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={item}>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                {t.login.email}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </motion.div>

            <motion.div variants={item}>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                {t.login.password}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </motion.div>

            {error && (
              <motion.div
                key={shakeKey}
                role="alert"
                initial={{ x: 0 }}
                animate={{ x: [0, -5, 5, -5, 5, 0] }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
              >
                {error}
              </motion.div>
            )}

            <motion.div variants={item}>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Spinner />
                    <span>{t.login.signingIn}</span>
                  </>
                ) : (
                  t.login.signIn
                )}
              </button>
            </motion.div>
          </form>

          <motion.p
            variants={item}
            className="mt-5 text-center text-xs text-slate-400"
          >
            {t.login.demo}: admin@manzara.uz / demo1234
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
