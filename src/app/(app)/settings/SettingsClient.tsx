"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import {
  User,
  Shield,
  Layers,
  Info,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Code2,
  BookOpen,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage, type Language } from "@/lib/i18n";
import type { Session } from "next-auth";
import type { getPrograms } from "@/lib/data";

type Programs = Awaited<ReturnType<typeof getPrograms>>;

type TabId = "account" | "pipeline" | "about";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "text-red-700 bg-red-50 border-red-200",
  MANAGER: "text-indigo-700 bg-indigo-50 border-indigo-200",
  VIEWER: "text-slate-600 bg-slate-50 border-slate-200",
};

interface Props {
  session: Session | null;
  programs: Programs;
}

export function SettingsClient({ session, programs }: Props) {
  const { t, lang, setLang } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>("account");

  const TABS = [
    { id: "account" as TabId, label: t.settings.tabs.account, icon: User },
    { id: "pipeline" as TabId, label: t.settings.tabs.pipeline, icon: Layers },
    { id: "about" as TabId, label: t.settings.tabs.about, icon: Info },
  ];

  const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };

  const LANGUAGES: { code: Language; label: string }[] = [
    { code: "en", label: t.settings.language.en },
    { code: "ru", label: t.settings.language.ru },
    { code: "uz", label: t.settings.language.uz },
  ];

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-semibold text-slate-900">{t.settings.title}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{t.settings.subtitle}</p>
      </motion.div>

      {/* Tab bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit"
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
              activeTab === id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "account" && (
          <motion.div
            key="account"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
            className="space-y-5"
          >
            {/* Profile card */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                {t.settings.profile.title}
              </h2>
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-indigo-700">
                    {session?.user?.name
                      ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                      : session?.user?.email?.[0].toUpperCase() ?? "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-base font-semibold text-slate-900">
                      {session?.user?.name ?? "—"}
                    </span>
                    {(session?.user as { role?: string } | undefined)?.role && (
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full border",
                        ROLE_COLORS[(session?.user as { role?: string }).role ?? "VIEWER"] ?? ROLE_COLORS.VIEWER
                      )}>
                        <Shield className="w-3 h-3 inline mr-1" />
                        {t.settings.roles[(session?.user as { role?: string }).role as keyof typeof t.settings.roles] ?? t.settings.roles.VIEWER}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{session?.user?.email ?? "—"}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  {t.settings.profile.adminNote}
                </p>
              </div>
            </motion.div>

            {/* Language switcher */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                {t.settings.language.title}
              </h2>
              <p className="text-xs text-slate-400 mb-4">{t.settings.language.subtitle}</p>
              <div className="flex items-center gap-2">
                {LANGUAGES.map(({ code, label }) => (
                  <button
                    key={code}
                    onClick={() => setLang(code)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                      lang === code
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Change password */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                {t.settings.password.title}
              </h2>
              <PasswordForm />
            </motion.div>
          </motion.div>
        )}

        {activeTab === "pipeline" && (
          <motion.div
            key="pipeline"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
            className="space-y-5"
          >
            {programs.map((program, pIdx) => (
              <motion.div
                key={program.id}
                variants={itemVariants}
                transition={{ delay: pIdx * 0.04 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">{program.name}</h2>
                    {program.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{program.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{program._count.projects} {t.settings.pipeline.projects}</span>
                    <span className="text-slate-200">|</span>
                    <span>{program.stages.length} {t.settings.pipeline.stages}</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-50">
                  {program.stages.map((stage, sIdx) => (
                    <div key={stage.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50">
                      <span className="text-xs font-mono text-slate-300 w-5 text-right flex-shrink-0">{sIdx + 1}</span>
                      <div
                        className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                        style={{ background: stage.color }}
                      />
                      <span className="flex-1 text-sm text-slate-700 font-medium">{stage.name}</span>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {t.settings.pipeline.sla} {stage.slaDays}{t.project.days}
                        </span>
                        {"fields" in stage && Array.isArray(stage.fields) && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {stage.fields.length} {t.settings.pipeline.fields}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            <motion.div variants={itemVariants} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-500">
                {t.settings.pipeline.adminNote}
              </p>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "about" && (
          <motion.div
            key="about"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
            className="space-y-5"
          >
            {/* Product info */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
                    <rect x="1.5" y="1.5" width="6.5" height="6.5" rx="1.5" fill="white" opacity="0.9" />
                    <rect x="10" y="1.5" width="6.5" height="6.5" rx="1.5" fill="white" opacity="0.6" />
                    <rect x="1.5" y="10" width="6.5" height="6.5" rx="1.5" fill="white" opacity="0.6" />
                    <rect x="10" y="10" width="6.5" height="6.5" rx="1.5" fill="white" opacity="0.3" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{t.settings.about.productName}</h2>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                      {t.settings.about.version}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{t.settings.about.tagline}</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {t.settings.about.description}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: t.settings.about.version_label, value: t.settings.about.version },
                  { label: t.settings.about.build, value: t.settings.about.buildValue },
                  { label: t.settings.about.license, value: t.settings.about.licenseValue },
                  { label: t.settings.about.environment, value: t.settings.about.envValue },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-lg px-3 py-2.5">
                    <div className="text-xs text-slate-400 font-medium">{item.label}</div>
                    <div className="text-sm text-slate-700 font-medium mt-0.5">{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tech stack */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-slate-400" />
                {t.settings.about.techStack}
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Next.js 15",
                  "TypeScript",
                  "Tailwind CSS v4",
                  "Prisma 7",
                  "PostgreSQL",
                  "NextAuth.js",
                  "Motion",
                  "Lucide Icons",
                ].map((tech) => (
                  <span
                    key={tech}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Demo credentials */}
            <motion.div variants={itemVariants} className="bg-indigo-50 rounded-xl border border-indigo-200 p-5">
              <h3 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-500" />
                {t.settings.about.demoCredentials}
              </h3>
              <div className="space-y-2">
                {[
                  { role: "Admin", email: "admin@manzara.uz", password: "demo1234" },
                  { role: "Manager", email: "manager@manzara.uz", password: "demo1234" },
                ].map((cred) => (
                  <div key={cred.role} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2.5 border border-indigo-100">
                    <span className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full border w-16 text-center",
                      ROLE_COLORS[cred.role.toUpperCase()] ?? ROLE_COLORS.VIEWER
                    )}>
                      {cred.role}
                    </span>
                    <span className="text-sm text-slate-600 font-mono flex-1">{cred.email}</span>
                    <span className="text-xs text-slate-400 font-mono">{cred.password}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-indigo-600 mt-3">
                {t.settings.about.demoNote}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PasswordForm() {
  const { t } = useLanguage();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setCurrentPw("");
    setNewPw("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {t.settings.password.current}
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="••••••••"
              className="w-full pr-9 pl-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((p) => !p)}
              aria-label={showCurrent ? t.settings.password.hide : t.settings.password.show}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {t.settings.password.new}
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="••••••••"
              className="w-full pr-9 pl-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowNew((p) => !p)}
              aria-label={showNew ? t.settings.password.hide : t.settings.password.show}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!currentPw || !newPw}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg"
        >
          {t.settings.password.save}
        </button>

        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 text-sm text-emerald-600"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t.settings.password.saved}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
