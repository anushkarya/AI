import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Home, Compass, GitBranch, CalendarDays, FlaskConical, Briefcase,
  GitPullRequest, Rocket, GraduationCap, Cpu, Library, Gauge, Settings as SettingsIcon,
  Search, ChevronDown, ChevronRight, Check, Circle, CircleDot, CheckCircle2,
  X, Plus, Trash2, ExternalLink, Clock, Flame, Award, AlertTriangle,
  BookOpen, Code2 as Github, Video, FileText, Link as LinkIcon, Download, Upload,
  RotateCcw, Info, Layers, Target, Shield, Zap, TrendingUp, MapPin,
  ChevronUp, Star, PlayCircle, PauseCircle, SkipForward, CalendarClock, Menu,
} from "lucide-react";





const STORAGE_KEY = "career-os-state-v1";

const DEFAULT_STATE = {
  skills: {},
  bootcamp: {},
  exams: {},
  projects: {},
  openSource: { steps: {}, prUrl: "", issueUrl: "", status: "not_started", reviewComments: "", merged: null, learned: "" },
  outreachy: { stage1: {}, stage2: {}, stage3: {}, stage4: {}, stage5: {}, contributionLog: [], projectCandidates: [], essayNotes: {} },
  academics: { subjects: [] },
  iot: { checks: {} },
  settings: { mode: "extreme", name: "" },
  dailyLog: {},
};

function deepMerge(base, incoming) {
  if (!incoming || typeof incoming !== "object") return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const k of Object.keys(incoming)) {
    if (incoming[k] && typeof incoming[k] === "object" && !Array.isArray(incoming[k]) && base[k] && typeof base[k] === "object") {
      out[k] = deepMerge(base[k], incoming[k]);
    } else {
      out[k] = incoming[k];
    }
  }
  return out;
}

function useCareerOsStorage() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const saveTimer = useRef(null);
  const savedFlashTimer = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          setState(deepMerge(DEFAULT_STATE, parsed));
        }
      } catch (e) {
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const flashSaved = () => {
    setSaveStatus("saved");
    if (savedFlashTimer.current) clearTimeout(savedFlashTimer.current);
    savedFlashTimer.current = setTimeout(() => setSaveStatus("idle"), 1800);
  };

  const persist = useCallback((next) => {
    setState(next);
    setSaveStatus("pending");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify(next), false);
        flashSaved();
      } catch (e) {
        console.error("Storage save failed", e);
        setSaveStatus("idle");
      }
    }, 400);
  }, []);

  const update = useCallback((path, value) => {
    setState((prev) => {
      const next = structuredClone ? structuredClone(prev) : JSON.parse(JSON.stringify(prev));
      let cur = next;
      for (let i = 0; i < path.length - 1; i++) {
        if (cur[path[i]] === undefined) cur[path[i]] = {};
        cur = cur[path[i]];
      }
      cur[path[path.length - 1]] = value;
      setSaveStatus("pending");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          await window.storage.set(STORAGE_KEY, JSON.stringify(next), false);
          flashSaved();
        } catch (e) {
          console.error(e);
          setSaveStatus("idle");
        }
      }, 400);
      return next;
    });
  }, []);

  const resetAll = useCallback(async () => {
    setState(DEFAULT_STATE);
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(DEFAULT_STATE), false); } catch (e) {}
  }, []);

  return { state, setState: persist, update, loaded, resetAll, saveStatus };
}



const TIER_COLORS = {
  S: { bg: "bg-amber-100", text: "text-amber-800", ring: "ring-amber-200", label: "Tier S" },
  A: { bg: "bg-emerald-100", text: "text-emerald-800", ring: "ring-emerald-200", label: "Tier A" },
  Watchlist: { bg: "bg-blue-100", text: "text-blue-800", ring: "ring-blue-200", label: "Watchlist" },
  "Dead-end": { bg: "bg-rose-100", text: "text-rose-800", ring: "ring-rose-200", label: "Dead-end" },
};

function TierBadge({ tier }) {
  const c = TIER_COLORS[tier] || TIER_COLORS.Watchlist;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono tracking-wide ${c.bg} ${c.text} ring-1 ${c.ring}`}>
      {c.label}
    </span>
  );
}

const TAG_STYLES = {
  FACT: "text-[#6FBFAE] border-[#6FBFAE]/30",
  INFERENCE: "text-[#9A98C9] border-[#9A98C9]/30",
  SPECULATION: "text-[#D3A15E] border-[#D3A15E]/30",
  APP: "text-[#7FA7D9] border-[#7FA7D9]/30",
  PROGRESS: "text-[#E8A33D] border-[#E8A33D]/30",
};

function SourceTag({ type }) {
  const labelMap = {
    FACT: "SOURCE FACT", INFERENCE: "SOURCE INFERENCE", SPECULATION: "SOURCE SPECULATION",
    APP: "APP RECOMMENDATION", PROGRESS: "USER PROGRESS",
  };
  return (
    <span className={`inline-block text-[10px] font-mono uppercase tracking-wider border rounded-sm px-1.5 py-0.5 ${TAG_STYLES[type] || ""}`}>
      {labelMap[type] || type}
    </span>
  );
}

function Panel({ children, className = "" }) {
  return (
    <div className={`cos-panel ${className}`}>{children}</div>
  );
}

function SectionHeader({ eyebrow, title, sub, right }) {
  return (
    <div className="cos-section-header flex items-start justify-between gap-4 mb-7 pb-5">
      <div>
        {eyebrow && <div className="cos-eyebrow font-mono text-[11px] mb-2">{eyebrow}</div>}
        <h1 className="cos-page-title text-3xl md:text-[2.15rem] font-semibold tracking-[-0.035em] text-[#0F172A]" style={{ fontFamily: "var(--font-display)" }}>{title}</h1>
        {sub && <p className="text-[#475569] text-sm md:text-[15px] mt-2 max-w-2xl leading-6">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function ProgressBar({ value, max = 100, colorClass = "bg-[#6366F1]" }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="cos-progress-track w-full h-2 rounded-full overflow-hidden">
      <div className={`cos-progress-fill h-full ${colorClass} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

const STATUS_ORDER = ["not_started", "learning", "understood", "built", "demonstrated"];
const STATUS_LABEL = { not_started: "Not started", learning: "Learning", understood: "Understood", built: "Built", demonstrated: "Demonstrated" };
const STATUS_COLOR = {
  not_started: "text-[#64748B] bg-[#F1F5F9]",
  learning: "text-[#D3A15E] bg-[#2E2A1C]",
  understood: "text-[#7FA7D9] bg-[#1D2733]",
  built: "text-[#6FBFAE] bg-[#ECFDF5]",
  demonstrated: "text-[#E8A33D] bg-[#FFFBEB]",
};

function StatusPill({ status }) {
  return (
    <span className={`cos-status-pill text-[11px] font-mono px-2.5 py-1 rounded-full ${STATUS_COLOR[status] || STATUS_COLOR.not_started}`}>
      {STATUS_LABEL[status] || "Not started"}
    </span>
  );
}

function StatusSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Status">
      {STATUS_ORDER.map((s) => (
        <button
          key={s}
          role="radio"
          aria-checked={value === s}
          onClick={() => onChange(s)}
          className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
            value === s
              ? "bg-[#E8A33D] text-[#14171C] border-[#E8A33D]"
              : "border-[#CBD5E1] text-[#64748B] hover:border-[#E8A33D]/50 hover:text-[#0F172A]"
          }`}
        >
          {STATUS_LABEL[s]}
        </button>
      ))}
    </div>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <button onClick={() => onChange(!checked)} role="checkbox" aria-checked={checked} className="flex items-start gap-2 text-left group w-full">
      <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
        checked ? "bg-[#6FBFAE] border-[#6FBFAE]" : "border-[#94A3B8] group-hover:border-[#6FBFAE]"
      }`}>
        {checked && <Check size={11} strokeWidth={3} className="text-[#14171C]" />}
      </span>
      <span className={`text-sm ${checked ? "text-[#64748B] line-through" : "text-[#334155]"}`}>{label}</span>
    </button>
  );
}

function TextField({ value, onChange, placeholder, icon: Icon }) {
  return (
    <div className="cos-input-wrap flex items-center gap-2 rounded-xl px-3 py-2 focus-within:border-[#6366F1]/70">
      {Icon && <Icon size={13} className="text-[#64748B] flex-shrink-0" />}
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="bg-transparent outline-none text-sm text-[#0F172A] placeholder-[#64748B] w-full"
      />
    </div>
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      rows={rows}
      className="cos-textarea w-full rounded-xl px-3 py-2.5 text-sm text-[#0F172A] placeholder-[#64748B] outline-none resize-none"
    />
  );
}

function Collapsible({ title, defaultOpen = false, children, right, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="cos-collapsible border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.035] transition-colors">
        <div className="flex items-center gap-2 min-w-0">
          {open ? <ChevronDown size={15} className="text-[#64748B] flex-shrink-0" /> : <ChevronRight size={15} className="text-[#64748B] flex-shrink-0" />}
          <span className="text-sm font-medium text-[#0F172A] truncate text-left">{title}</span>
          {badge}
        </div>
        {right}
      </button>
      {open && <div className="px-4 pb-4 pt-1 border-t border-[#E2E8F0] cos-fade-in">{children}</div>}
    </div>
  );
}

function EvidenceRow({ label, icon: Icon, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={13} className="text-[#64748B] w-16 flex-shrink-0" />
      <span className="text-xs text-[#64748B] w-16 flex-shrink-0">{label}</span>
      <TextField value={value} onChange={onChange} placeholder={`${label} URL`} />
      {value && <a href={value} target="_blank" rel="noreferrer" aria-label={`Open ${label} link`} className="text-[#6FBFAE] flex-shrink-0"><ExternalLink size={13} /></a>}
    </div>
  );
}

function EvidenceBlock({ evidence = {}, onChange }) {
  const set = (k, v) => onChange({ ...evidence, [k]: v });
  return (
    <div className="space-y-1.5">
      <EvidenceRow label="GitHub" icon={Github} value={evidence.github} onChange={(v) => set("github", v)} />
      <EvidenceRow label="Demo" icon={Video} value={evidence.demo} onChange={(v) => set("demo", v)} />
      <EvidenceRow label="Report" icon={FileText} value={evidence.report} onChange={(v) => set("report", v)} />
      <EvidenceRow label="Benchmark" icon={TrendingUp} value={evidence.benchmark} onChange={(v) => set("benchmark", v)} />
      <EvidenceRow label="Paper" icon={BookOpen} value={evidence.paper} onChange={(v) => set("paper", v)} />
    </div>
  );
}

function ConfidenceSlider({ value = 0, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#64748B] w-20">Confidence</span>
      <input type="range" min="0" max="5" value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-[#E8A33D]" />
      <span className="text-xs font-mono text-[#E8A33D] w-4">{value}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="text-center py-12 text-[#64748B]">
      <Icon size={28} className="mx-auto mb-3 opacity-50" />
      <div className="text-sm font-medium text-[#64748B]">{title}</div>
      {sub && <div className="text-xs mt-1 max-w-sm mx-auto">{sub}</div>}
    </div>
  );
}




const FIELDS = [
  { id: "agentic-systems", name: "Agentic AI Systems Engineering", cluster: "AI × Systems/Infra", tier: "S", oneLiner: "Designing, orchestrating and hardening multi-agent LLM systems — tool use, memory, planning, guardrails." },
  { id: "agentic-security", name: "Agentic AI Security & Evaluation", cluster: "AI × Systems/Infra", tier: "S", oneLiner: "The \u201cwho tests/secures the agents\u201d specialization — smaller talent pool, growing even faster in percentage terms." },
  { id: "inference-optimization", name: "AI Inference Optimization / ML Systems Engineering", cluster: "AI × Systems/Infra", tier: "S", oneLiner: "Serving infrastructure, cost/latency optimization, distributed inference — the systems layer under every capex dollar." },
  { id: "edge-ai", name: "Edge AI / On-Device Intelligence", cluster: "AI × Systems/Infra", tier: "S", oneLiner: "Quantization, on-device inference, NPU-aware engineering shipped inside real mobile apps." },
  { id: "ai-infra-mlops", name: "AI Infrastructure / MLOps at Hyperscale", cluster: "AI × Systems/Infra", tier: "A", oneLiner: "Running AI infrastructure at hyperscaler scale — huge capital, but hard to enter without big-co access." },
  { id: "ai-dev-tools", name: "AI-Native Developer Tools", cluster: "AI × Systems/Infra", tier: "A", oneLiner: "Agents-for-coding, eval harnesses, and the tooling layer around agent development itself." },
  { id: "synthetic-data-sim", name: "Synthetic Data & Simulation-for-Training Engineering", cluster: "AI × Systems/Infra", tier: "A", oneLiner: "Building the simulated data pipelines that train physical- and agentic-AI models." },
  { id: "llm-compiler", name: "LLM Compiler / Kernel Engineering", cluster: "AI × Systems/Infra", tier: "A", oneLiner: "CUDA, Triton, MLIR — the lowest-level layer of making models fast." },
  { id: "retrieval-infra", name: "Retrieval / Knowledge Infrastructure at Scale", cluster: "AI × Systems/Infra", tier: "Watchlist", oneLiner: "Vector DBs and RAG-at-scale — real, but commoditizing fast." },
  { id: "generic-rag", name: "Generic RAG-Chatbot Development", cluster: "AI × Systems/Infra", tier: "Dead-end", oneLiner: "Already a commodity skill by late 2025 — everyone in software is expected to know this baseline." },
  { id: "physical-ai", name: "Physical AI / Embodied AI & Simulation", cluster: "AI × Physical World", tier: "S", oneLiner: "Robotics perception/planning trained and evaluated in simulation (NVIDIA Isaac/Cosmos-style stacks)." },
  { id: "robotics-perception", name: "Robotics Perception (CV for Manipulation/Navigation)", cluster: "AI × Physical World", tier: "A", oneLiner: "Computer vision specifically for physical systems — manipulation and navigation." },
  { id: "humanoid-actuation", name: "Humanoid Actuation / Mechatronics", cluster: "AI × Physical World", tier: "Watchlist", oneLiner: "Hardware-heavy — needs mechanical/electrical engineering depth beyond a CS curriculum." },
  { id: "av-l4", name: "Autonomous Driving L4 Stack Engineering", cluster: "AI × Physical World", tier: "Watchlist", oneLiner: "Maturing and consolidating — hiring has slowed from its 2018-2021 peak." },
  { id: "drone-autonomy", name: "Drone / UAV Autonomy Software", cluster: "AI × Physical World", tier: "A", oneLiner: "Autonomy software for uncrewed aerial systems, both civilian and defense-adjacent." },
  { id: "industrial-robotics", name: "Industrial Robotics + AI", cluster: "AI × Physical World", tier: "A", oneLiner: "Factory-automation robotics augmented with modern perception/planning AI." },
  { id: "computational-biology", name: "Computational Biology / AI-Drug-Discovery", cluster: "AI × Biology/Health", tier: "A", oneLiner: "Fusing generative AI with molecular/biological discovery — huge capital, needs bio/chem depth." },
  { id: "protein-ml", name: "Protein / Molecular ML", cluster: "AI × Biology/Health", tier: "Watchlist", oneLiner: "Structure prediction and generative chemistry — needs strong biology/chemistry foundations." },
  { id: "clinical-ai", name: "Clinical AI / Fairness-Aware Medical ML", cluster: "AI × Biology/Health", tier: "A", oneLiner: "Bias-audited medical ML — you already have real project experience here." },
  { id: "self-driving-lab", name: "Digital Biology \u201cSelf-Driving Lab\u201d Engineering", cluster: "AI × Biology/Health", tier: "Watchlist", oneLiner: "Fusing robotic wet-labs with generative AI in a closed feedback loop." },
  { id: "chip-design", name: "AI Accelerator / Chip Design (RTL, EDA-assisted)", cluster: "Semiconductors/Hardware", tier: "A", oneLiner: "Designing the silicon AI actually runs on — India's Semicon Mission makes this newly accessible." },
  { id: "ai-for-eda", name: "AI-for-EDA (ML to speed up chip design itself)", cluster: "Semiconductors/Hardware", tier: "A", oneLiner: "Using ML to accelerate the chip-design process — a meta-layer above chip design proper." },
  { id: "semi-manufacturing", name: "Semiconductor Process / Manufacturing Engineering", cluster: "Semiconductors/Hardware", tier: "Watchlist", oneLiner: "Needs materials-science/EE depth beyond a CS-only track." },
  { id: "photonics", name: "Photonics for AI Interconnects", cluster: "Semiconductors/Hardware", tier: "Watchlist", oneLiner: "Early, very technical, small talent pool — a long-horizon bet." },
  { id: "ai-cybersecurity", name: "Agentic / AI-to-AI Cybersecurity (SOC Automation)", cluster: "Security/Defense", tier: "A", oneLiner: "Autonomous defense systems responding to autonomous attacks — a fast-growing security niche." },
  { id: "appsec", name: "Traditional Application Security / Pentesting", cluster: "Security/Defense", tier: "Watchlist", oneLiner: "Valuable, but a commoditized skill rather than a moat." },
  { id: "defense-tech", name: "Defense-Tech Autonomy Software", cluster: "Security/Defense", tier: "A", oneLiner: "Drones, mission systems — record VC, but carries real ethical weight worth thinking through independently." },
  { id: "quantum-crypto", name: "Quantum-Safe Cryptography Engineering", cluster: "Security/Defense", tier: "A", oneLiner: "Preparing systems for the post-quantum cryptography transition." },
  { id: "quantum-software", name: "Quantum Software / Quantum-Classical Hybrid Algorithms", cluster: "Quantum", tier: "A", oneLiner: "Real capital, but the non-PhD hiring window is still mostly 2030+." },
  { id: "quantum-hardware", name: "Quantum Hardware Engineering", cluster: "Quantum", tier: "Watchlist", oneLiner: "Needs a physics PhD-track background to enter meaningfully." },
  { id: "grid-ai", name: "AI for Power-Grid Optimization / Datacenter Energy Management", cluster: "Energy/Climate", tier: "Watchlist", oneLiner: "A real software-for-energy niche inside the nuclear/SMR buildout for AI datacenters." },
  { id: "climate-ai", name: "Climate Modeling / AI-for-Weather", cluster: "Energy/Climate", tier: "Watchlist", oneLiner: "AI-accelerated physical simulation (e.g. NVIDIA Earth-2-style work)." },
  { id: "battery-ai", name: "Battery / Materials Discovery via AI", cluster: "Energy/Climate", tier: "Watchlist", oneLiner: "Needs materials-science depth beyond a CS curriculum." },
  { id: "satellite-ai", name: "Satellite Data Analytics / Geospatial AI", cluster: "Space", tier: "A", oneLiner: "India has real players here (e.g. Pixxel) — a genuinely India-accessible space-tech niche." },
  { id: "space-systems", name: "Space-Systems Software Engineering", cluster: "Space", tier: "Watchlist", oneLiner: "Real, but a narrower and more specialized hiring pool." },
  { id: "ai-safety", name: "AI Safety / Interpretability Research", cluster: "Other/Cross-cutting", tier: "Watchlist", oneLiner: "Real and important, but near-monopolized by frontier labs and grad-school gatekeeping." },
  { id: "ai-policy", name: "AI Policy / Governance", cluster: "Other/Cross-cutting", tier: "Watchlist", oneLiner: "Real, but low technical moat for a strong CS profile — a different skill set entirely." },
  { id: "web3-ai", name: "Web3 / Crypto-AI Convergence", cluster: "Other/Cross-cutting", tier: "Dead-end", oneLiner: "Capital has mostly rotated out since 2022; high noise-to-signal remaining." },
  { id: "ai-ethics-role", name: "Generic \u201cAI Ethics\u201d Advisory Roles (Non-Technical)", cluster: "Other/Cross-cutting", tier: "Dead-end", oneLiner: "Important subject matter, near-zero technical moat as a career bet for a CS student." },
  { id: "generic-webdev", name: "Generic Full-Stack / Bootcamp-Grade Web Development", cluster: "Other/Cross-cutting", tier: "Dead-end", oneLiner: "Heavily oversaturated in India specifically; AI copilots compressed the entry-level wage premium fastest here." },
];

const SCORED = [
  { id: "agentic-systems", marketPull: 9, technicalMoat: 7, accessibility: 9, resumeSignal: 8, weighted: 8.2 },
  { id: "agentic-security", marketPull: 8, technicalMoat: 8, accessibility: 8, resumeSignal: 8, weighted: 8.0 },
  { id: "edge-ai", marketPull: 8, technicalMoat: 8, accessibility: 9, resumeSignal: 8, weighted: 8.1 },
  { id: "physical-ai", marketPull: 9, technicalMoat: 8, accessibility: 6, resumeSignal: 7, weighted: 7.7 },
  { id: "inference-optimization", marketPull: 9, technicalMoat: 9, accessibility: 5, resumeSignal: 8, weighted: 7.7 },
  { id: "ai-infra-mlops", marketPull: 9, technicalMoat: 7, accessibility: 4, resumeSignal: 7, weighted: 6.9 },
  { id: "computational-biology", marketPull: 9, technicalMoat: 9, accessibility: 3, resumeSignal: 7, weighted: 6.9 },
  { id: "chip-design", marketPull: 8, technicalMoat: 8, accessibility: 6, resumeSignal: 7, weighted: 7.3 },
  { id: "robotics-perception", marketPull: 8, technicalMoat: 7, accessibility: 6, resumeSignal: 7, weighted: 7.1 },
  { id: "defense-tech", marketPull: 8, technicalMoat: 7, accessibility: 4, resumeSignal: 6, weighted: 6.4 },
  { id: "quantum-software", marketPull: 7, technicalMoat: 9, accessibility: 4, resumeSignal: 6, weighted: 6.5 },
  { id: "satellite-ai", marketPull: 6, technicalMoat: 6, accessibility: 7, resumeSignal: 6, weighted: 6.3 },
  { id: "ai-dev-tools", marketPull: 7, technicalMoat: 6, accessibility: 8, resumeSignal: 6, weighted: 6.8 },
  { id: "generic-rag", marketPull: 3, technicalMoat: 2, accessibility: 10, resumeSignal: 2, weighted: 3.4 },
  { id: "generic-webdev", marketPull: 3, technicalMoat: 2, accessibility: 10, resumeSignal: 2, weighted: 3.4 },
];

const DEADEND_NOTES = [
  { title: "Generic RAG-chatbot / \u201cAI wrapper\u201d development", reasoning: "By late 2025 this had already become a commodity skill — the bootcamp itself flags and rejects this as a portfolio piece, correctly." },
  { title: "Prompt engineering as a standalone job title", reasoning: "Briefly a real niche in 2023; by 2026 it's a baseline skill everyone in software is expected to have, not a differentiator." },
  { title: "Generic full-stack/bootcamp-grade web development", reasoning: "Massively oversaturated in India specifically; AI copilots have compressed the entry-level wage premium for this the fastest of any category." },
  { title: "\u201cAI ethics\u201d as a standalone non-technical advisory role", reasoning: "The subject matter is real and important, but as a career bet for a strong CS student the technical-moat score is near zero — you'd be competing against policy/philosophy backgrounds for few roles." },
  { title: "Web3/crypto-AI convergence", reasoning: "Capital has mostly rotated out since 2022; what remains is high noise-to-signal." },
  { title: "Metaverse/VR-social platforms", reasoning: "The 2021-22 investment thesis largely didn't pan out at the scale predicted; hiring never materialized the way \u201cfuture of computing\u201d narratives claimed." },
  { title: "Autonomous vehicles (L4, full stack)", reasoning: "Real technology, but the field is consolidating, not expanding — a handful of companies dominate, hiring has slowed from its 2018-2021 peak, and remaining problems need years of specialized experience." },
  { title: "Traditional QA/manual testing career track", reasoning: "Being automated by AI-driven test generation faster than almost any other software role." },
];

const TIER_S_DETAIL = {
  "agentic-systems": {
    analogue: "Was it obscure 5-10 years ago? Yes — \u201cagent\u201d meant a chatbot with function-calling as recently as 2023. Is demand outpacing curricula? Yes — no Indian CS syllabus teaches multi-agent orchestration or agent evaluation yet. Are companies struggling to hire? Yes — the 79%-adopting/11%-scaled gap is direct evidence. Is this genuinely a lab-to-industry transition? Yes — it moved from research demos (2023) to board-level enterprise mandates (2026) in under 3 years, unusually fast even by AI standards.",
    roles: {
      "2026": ["Agent/orchestration engineer", "AI product engineer", "LLM application engineer"],
      "2030": ["Agentic systems architect", "Multi-agent reliability engineer", "AI workflow automation lead"],
      "2036": ["Principal engineer for autonomous enterprise operations — designing and certifying fleets of agents making real business decisions with minimal human review"],
    },
    scores: [6, 9, 9, 9, 5, 10, 7, 8, 4, 8, 9, 6, 10, 9, 10, 8, 6, 4, 9, 9, 7, 9, 8, 6],
  },
  "agentic-security": {
    analogue: "This is the \u201capplication security\u201d of the agent era — appsec didn't exist as a distinct discipline until web apps were everywhere and breaches got expensive; the same pattern is repeating with agents right now (88% incident rate in production). Companies are building agents faster than they can secure them — an almost textbook \u201cregulation and incidents will soon force specialist hiring\u201d pattern.",
    roles: {
      "2026": ["AI red-teamer", "Agent evaluation engineer", "LLM security researcher"],
      "2030": ["Agentic-systems security architect", "Autonomous-system auditor"],
      "2036": ["Head of AI assurance / certifier of autonomous decision systems — a role that may become as standard as CISO is today"],
    },
    scores: [4, 8, 9, 9, 6, 6, 8, 9, 5, 8, 7, 8, 9, 7, 10, 9, 3, 3, 8, 8, 9, 8, 9, 8],
  },
  "edge-ai": {
    analogue: "Mobile development itself was the \u20182010 gold rush\u2019; on-device AI is the analogous moment for 2026 — NPUs just crossed the usability threshold the way smartphone GPUs did around 2010-2012. Very few engineers combine production mobile shipping experience with quantization/inference-engineering depth — this is a supply gap, not a demand gap, and it's the field where an existing Kotlin/Android background is a direct unlock, not a generic transferable skill.",
    roles: {
      "2026": ["Android ML engineer", "On-device inference engineer", "Mobile AI SDK engineer"],
      "2030": ["Edge-AI platform engineer (cross-device: phone, AI PC, wearable, car)"],
      "2036": ["Principal engineer for personal/private on-device AI systems — as data-sovereignty regulation matures, this becomes compliance-critical, not just a performance specialization"],
    },
    scores: [6, 8, 9, 8, 3, 8, 7, 8, 3, 7, 7, 5, 9, 10, 9, 7, 5, 3, 10, 7, 9, 10, 7, 6],
  },
  "physical-ai": {
    analogue: "NVIDIA explicitly compared 2026 to \u201cthe ChatGPT moment for robotics\u201d (Jensen Huang, CES 2026) — deliberately invoking the LLM-boom analogy. Capital is accelerating far ahead of deployment, which is exactly the \u201cinfrastructure before enough specialists exist\u201d pattern to look for.",
    roles: {
      "2026": ["Simulation engineer", "Robot-learning engineer", "Perception engineer (mostly needs real-robot access at the frontier, but simulation-only roles are opening at NVIDIA-ecosystem companies)"],
      "2030": ["Embodied-AI systems engineer", "Sim-to-real transfer specialist"],
      "2036": ["Autonomy architect for general-purpose robots deployed at industrial scale"],
    },
    scores: [6, 9, 10, 10, 6, 7, 9, 8, 6, 8, 9, 9, 7, 6, 9, 9, 3, 3, 5, 6, 9, 7, 8, 8],
  },
  "inference-optimization": {
    analogue: "Directly parallels the \u201csystems programmer\u201d shortage of the early cloud-computing boom — every hyperscaler capex dollar ultimately needs someone who can make inference cheaper and faster; the most capital-adjacent field on the whole list, but also the hardest to break into without access to real production-scale infrastructure.",
    roles: {
      "2026": ["ML systems engineer", "Inference engineer", "Performance engineer"],
      "2030": ["Distributed-inference architect"],
      "2036": ["Principal engineer for planet-scale AI serving infrastructure"],
    },
    scores: [8, 9, 9, 9, 4, 9, 9, 9, 7, 9, 6, 7, 10, 5, 9, 9, 4, 2, 6, 8, 8, 6, 8, 7],
  },
};

const DIMENSION_LABELS = [
  "Current market size", "Expected 2030 market size", "Expected 2036 market potential", "Investment acceleration",
  "Government spending", "Corporate adoption", "Technical difficulty", "Talent scarcity", "Barrier to entry",
  "Salary potential", "Startup potential", "Research potential", "CS compatibility", "Undergrad-enterable",
  "AI complementarity", "Strategic-importance probability", "Commoditization risk", "Entry-level AI-replacement risk",
  "India accessibility", "Remote-job potential", "Resume differentiation", "Cheap-impressive-projects possible",
  "Demand > supply by 2030", "Demand > supply by 2036",
];

const SKILL_NODES = [
  { id: "math", name: "Math (linear algebra, probability, optimization)", what: "Vectors/matrices/eigendecomposition, Bayesian reasoning and distributions, gradient-descent intuition.", why: "The layer everything else sits on — attention is matrix math, evaluation is probability, training is optimization. Your IOQM background already gives you the mathematical maturity most CS students lack.", prereqs: "None — but do not skip.", days: [1, 5], resources: ["Your existing IOQM-level math maturity, applied rather than re-derived from zero", "Jacob et al., \u201cQuantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference\u201d (2017) — for the applied side of this math"], exercise: "Day 5: compute memory footprint of a 1B-parameter model at FP32/FP16/INT8/INT4 by hand.", projectLink: "Underpins Flagship #1's quantization pipeline math." },
  { id: "python", name: "Python (existing toolchain)", what: "Python 3.11 + venv + pip + VS Code — your already-standardized toolchain from the prior ML sprint.", why: "Every day of the bootcamp assumes this is already fluent; it's the substrate, not a new skill to learn from scratch.", prereqs: "None.", days: [1], resources: ["Your own existing sprint environment"], exercise: "Day 1: environment setup — confirm Python 3.11 + venv + a working Colab/Kaggle session.", projectLink: "Every flagship project runs on this toolchain." },
  { id: "ml-fundamentals", name: "ML Fundamentals", what: "Core supervised-learning concepts: loss functions, train/test splits, overfitting, evaluation basics — largely already covered by your fairness-aware ML research pipeline.", why: "Evaluation rigor (Week 4) directly extends what you already practiced auditing a model for bias on the heart-disease project.", prereqs: "Math.", days: [10, 22], resources: ["Your own existing heart-disease fairness-ML project as a working reference"], exercise: "Day 10: design 10 test cases spanning easy/medium/adversarial.", projectLink: "Feeds directly into the Evaluation skill node and Flagship #1's benchmark suite." },
  { id: "neural-networks", name: "Neural Networks", what: "The building blocks under transformers: layers, activations, backprop intuition.", why: "You don't need to re-derive this from scratch if your existing transformer-from-scratch sprint work already covers it — this node exists to make sure that foundation is solid before Week 1.", prereqs: "Math, ML fundamentals.", days: [1], resources: ["Your existing v4/v5 sprint materials: tokenizer \u2192 attention \u2192 multi-head \u2192 full transformer \u2192 causal masking \u2192 tiny GPT \u2192 KV caching \u2192 quantization"], exercise: "Reread your own prior sprint notes before Day 1.", projectLink: "Prerequisite for the Transformers node." },
  { id: "transformers", name: "Transformers", what: "Attention, multi-head attention, causal masking, KV caching — the architecture under every LLM.", why: "You already built this from scratch in the prior sprint; Week 1 assumes it and moves straight to agent behavior on top of it.", prereqs: "Neural networks.", days: [1], resources: ["Your existing from-scratch transformer build (tokenizer \u2192 attention \u2192 ... \u2192 KV caching \u2192 quantization)", "Yao et al., \u201cReAct: Synergizing Reasoning and Acting in Language Models\u201d (2022)"], exercise: "Day 1 deep work: hand-write the JSON payload an LLM needs to emit for a tool call.", projectLink: "Foundation for every agent-loop project this month." },
  { id: "llms", name: "LLMs (as deployed systems, not just architecture)", what: "Function-calling/tool-use APIs, context windows, provider-specific quirks.", why: "The gap between \u201cunderstands transformers\u201d and \u201ccan build a production agent\u201d is knowing the deployed API surface, not just the math.", prereqs: "Transformers.", days: [1, 2], resources: ["Your LLM provider's official tool-use/function-calling documentation, read end to end"], exercise: "Day 2: deliberately craft prompts that make a model emit malformed tool calls, and categorize why.", projectLink: "Flagship #1's agent core." },
  { id: "tool-calling", name: "Tool Calling / Structured Output", what: "Tool use as structured JSON output parsing, schema validation, retry/repair strategies.", why: "This is where an agent stops being a chatbot and starts being able to act — and where most silent failures originate.", prereqs: "LLMs.", days: [1, 2], resources: ["Schick et al., \u201cToolformer: Language Models Can Teach Themselves to Use Tools\u201d (2023)"], exercise: "Day 2: add schema validation and a one-retry repair loop.", projectLink: "Flagship #1's tool-execution layer; Flagship #2's attack-surface enumeration starts here." },
  { id: "react", name: "ReAct (think-act-observe loop)", what: "The reasoning \u2192 acting \u2192 observing loop that underlies most agent architectures.", why: "It's the actual mechanism, at the wire-protocol level, of what \u201cagentic\u201d means — understanding it by hand prevents cargo-culting a framework later.", prereqs: "Tool calling.", days: [1, 8], resources: ["Yao et al., \u201cReAct: Synergizing Reasoning and Acting in Language Models\u201d (2022), method section"], exercise: "Day 8: write the full agent state machine on paper before coding.", projectLink: "Core loop of Flagship #1's framework-free agent." },
  { id: "mcp", name: "MCP (Model Context Protocol)", what: "The emerging standard transport/message format for agent-to-tool communication.", why: "Standardizes what would otherwise be custom glue code per tool — increasingly the industry-standard interface.", prereqs: "ReAct.", days: [1], resources: ["modelcontextprotocol.io — official specification, \u201cTools\u201d section", "The official \u2018modelcontextprotocol/servers\u2019 reference implementations on GitHub"], exercise: "Day 1: read the MCP Tools spec in full before writing any code.", projectLink: "Open-source track (Day 26) targets MCP server implementations directly." },
  { id: "memory", name: "Agent Memory", what: "Context-window-as-short-term-memory vs. external long-term memory via embeddings.", why: "Distinguishes an agent that can act once from one that can operate coherently across a week of separate conversations.", prereqs: "ReAct.", days: [3], resources: ["Lewis et al., \u201cRetrieval-Augmented Generation for Knowledge-Intensive NLP Tasks\u201d (2020)", "Chroma or FAISS getting-started docs (pick one)"], exercise: "Day 3: design a week-long-memory architecture on paper before building.", projectLink: "Flagship #1's memory store." },
  { id: "rag", name: "RAG / Retrieval", what: "Retrieve-then-generate as one specific implementation pattern of memory — not identical to memory itself.", why: "Distinguishing RAG from memory prevents architecture confusion later — RAG is a tool, memory is a requirement.", prereqs: "Memory.", days: [3], resources: ["Lewis et al. (2020), architecture diagram"], exercise: "Day 3: build a minimal embed-store-retrieve loop with a local embedding model.", projectLink: "Flagship #1's retrieval layer." },
  { id: "planning", name: "Planning / Multi-Step Reasoning", what: "How an agent decomposes a task into ordered steps and tracks state across them.", why: "The difference between a script with an if-statement and something honestly called \u201cagentic.\u201d", prereqs: "ReAct, Memory.", days: [4, 8], resources: ["Your own Day 8 state-machine design as the working reference"], exercise: "Day 8: define every exit condition (success, failure, max-steps, user-cancelled) before coding.", projectLink: "Flagship #1's core loop." },
  { id: "multi-agent", name: "Multi-Agent Systems", what: "Planner/worker, debate, and hierarchical delegation coordination patterns — and when they're not worth the overhead.", why: "Knowing when NOT to add a second agent is as much the skill as knowing how to coordinate one.", prereqs: "Planning.", days: [4, 15, 16, 17], resources: ["A recent multi-agent LLM survey paper (search arXiv, pick the most-cited)", "One production multi-agent engineering blog post from a real company (not a tutorial)"], exercise: "Day 4: design one task two ways (single agent vs. 3-agent pipeline) and record real trade-offs.", projectLink: "Level 3 project #1 (3+ agent hierarchical delegation system)." },
  { id: "evaluation", name: "Evaluation & Benchmarking", what: "Automated multi-metric test harnesses, ablation studies, statistically honest multi-run reporting.", why: "The line between \u201ca demo\u201d and \u201cevidence a recruiter can trust\u201d — this is the single most differentiating skill in the whole stack.", prereqs: "ML fundamentals, Planning.", days: [10, 22, 23], resources: ["Liu et al., \u201cAgentBench: Evaluating LLMs as Agents\u201d (2023)", "Mialon et al., \u201cGAIA: A Benchmark for General AI Assistants\u201d (2023)"], exercise: "Day 22: write the methodology section before running final numbers.", projectLink: "Flagship #1's benchmark dashboard; core of the Agentic AI Security & Evaluation career field." },
  { id: "security", name: "Agent Security", what: "Least-privilege tool sandboxing, prompt-injection defense, threat modeling for non-deterministic systems.", why: "88% of enterprises running agents in production report security incidents — this is the widest hiring gap on the whole career map.", prereqs: "Tool calling, Evaluation.", days: [9, 11, 19], resources: ["OWASP Top 10 for LLM Applications — Excessive Agency and Prompt Injection sections", "MITRE ATLAS (Adversarial Threat Landscape for AI Systems)", "Simon Willison's writing on indirect prompt injection"], exercise: "Day 11: design (not necessarily execute) an indirect-injection scenario against your own Day 8 agent.", projectLink: "Flagship #2 — the entire Agentic AI Security Red-Team Tool." },
  { id: "quantization", name: "Quantization", what: "FP32/FP16/INT8/INT4 numerical precision, GPTQ/GGUF post-training quantization.", why: "The specific mechanism that makes on-device AI possible at all.", prereqs: "Math, Neural networks.", days: [5, 12], resources: ["Jacob et al. (2017)", "Frantar et al., \u201cGPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers\u201d (2023)", "ggerganov/llama.cpp README and GGUF format docs"], exercise: "Day 12: quantize the same model at two levels and compare accuracy/speed with your own eval harness.", projectLink: "Flagship #3 — Cross-Device Edge AI Benchmark Suite." },
  { id: "inference-eng", name: "Inference Engineering", what: "Serving, latency/cost trade-offs, P95 (not just average) performance measurement.", why: "Average latency hides the real user experience — the tail is what actually gets an app uninstalled.", prereqs: "Quantization.", days: [12, 20], resources: ["llama-bench (part of llama.cpp)", "Android Studio Profiler documentation (CPU, Memory, Energy tabs)"], exercise: "Day 20: design a sustained-use test protocol, not a single happy-path run.", projectLink: "Flagship #1 and #3's performance reports." },
  { id: "on-device-ai", name: "On-Device AI", what: "Running quantized models locally: LiteRT (TensorFlow Lite), MLC-LLM, ONNX Runtime Mobile, NNAPI as the hardware-abstraction layer.", why: "The edge-AI hardware market is projected to roughly double by 2031 — and very few engineers combine this with production mobile shipping experience.", prereqs: "Quantization, Inference engineering.", days: [6, 13], resources: ["Google's LiteRT (TensorFlow Lite) Android quickstart", "mlc-ai/mlc-llm Android deployment guide", "Android Neural Networks API developer guide"], exercise: "Day 6: diagram the full path a prompt takes from UI thread to NPU and back.", projectLink: "Flagship #1's on-device path; Flagship #3 in full." },
  { id: "android-deployment", name: "Android Deployment", what: "Integrating on-device inference into a real, shippable Android app, with graceful cloud fallback.", why: "This is the actual moat combination — pairs your existing Kotlin/ANCHOR background with ML systems depth almost nobody else has both of.", prereqs: "On-device AI.", days: [6, 13, 17, 20], resources: ["Your own ANCHOR app architecture as a starting point", "Chosen runtime's production/app-integration guide (memory-management sections)"], exercise: "Day 13: design one fallback for every realistic real-device failure mode.", projectLink: "Flagship #1's full Android integration." },
  { id: "observability", name: "Observability", what: "Structured logging, correlation IDs across multi-step runs, metrics worth alerting on.", why: "Debug prints don't scale to a multi-step, non-deterministic agent system running on someone else's phone you can't see.", prereqs: "Android deployment, Multi-agent systems.", days: [18], resources: ["Any structured-logging library's docs for your stack"], exercise: "Day 18: design a correlation-ID scheme spanning planning \u2192 routing \u2192 tool calls \u2192 response.", projectLink: "Flagship #1's telemetry layer." },
  { id: "production-systems", name: "Production-Style Systems Thinking", what: "Everything above, integrated: routing logic, fallback paths, security hardening, and honest limitations documentation, all in one shipped system.", why: "This is the actual deliverable — a system that reads as \u2018this student understands the field\u2019 rather than \u2018this student followed a tutorial.\u2019", prereqs: "All prior nodes.", days: [15, 16, 17, 18, 19, 20, 21], resources: ["Your own Week 1-3 repo, reread critically as if reviewing a stranger's PR"], exercise: "Day 15: write the full architecture doc before touching code for the hybrid system.", projectLink: "Flagship #1, complete." },
];

const BOOTCAMP_WEEKS = [
  {
    week: 1, title: "Foundations — agent architecture + on-device basics",
    days: [
      { day: 1, week: 1, objective: "Understand the agent loop at a wire-protocol level, not a framework-abstraction level.", study: "Think-act-observe (ReAct) loop; what \u201ctool use\u201d actually is at the JSON level; MCP as the emerging standard for tool interfaces.", materials: ["Paper: Yao et al., \u201cReAct: Synergizing Reasoning and Acting in Language Models\u201d (2022) — read the method section closely", "Spec: modelcontextprotocol.io — official MCP specification, architecture pages", "Repo: the official \u2018modelcontextprotocol/servers\u2019 reference implementations on GitHub"], deepWork: "By hand, write the JSON payload an LLM needs to emit to call a get_weather(city) tool, and the JSON response needed for the model to use it correctly next turn.", build: "A Python script that calls an LLM API, gives it one fake tool definition, and manually parses its tool-call output — no agent framework.", read: "The MCP specification's \u201cTools\u201d section in full.", think: "If an agent calls a tool that returns a wrong but plausible-looking result, how would the agent know? How would you know, watching only the logs?", miniTest: ["What are the three phases of the ReAct loop?", "What problem does structured tool-calling output solve that free-text generation doesn't?", "Name one thing MCP standardizes that a hand-rolled tool interface wouldn't.", "Why is a tool's response schema as important to design carefully as its request schema?", "What happens to an agent loop if a tool call times out — what should the agent do?"], answers: ["Reason (think) \u2192 Act (call a tool) \u2192 Observe (read the result), then repeat.", "It gives a parseable, verifiable signal instead of guessing intent from prose — critical for reliability and safety checks.", "A common transport/message format so any agent can talk to any tool server without custom glue code per pair.", "A malformed or ambiguous response schema is a common silent-failure source — the model can misinterpret it and confidently act on bad information.", "It should have an explicit timeout-handling branch (retry, fallback, or surface the failure) — no handling means it hangs or hallucinates a result."], output: "Working tool-call parser script + a written note (200-300 words) on what could silently go wrong in this loop.", checkpoint: "Explain the ReAct loop and one concrete failure mode, from memory, without notes." },
      { day: 2, week: 1, objective: "Understand tool-use as structured output parsing, including its failure modes.", study: "JSON schema validation for LLM outputs; valid JSON vs. a correct tool call; retry/repair strategies for malformed output.", materials: ["Paper: Schick et al., \u201cToolformer: Language Models Can Teach Themselves to Use Tools\u201d (2023)", "Docs: your LLM provider's function-calling/tool-use API reference, read end to end"], deepWork: "Deliberately craft three prompts that make a model emit malformed tool calls, and categorize why each failed.", build: "Add schema validation + a one-retry repair loop to Day 1's script: on malformed call, feed the error back to the model for one repair attempt before failing loudly.", read: "Your LLM provider's official tool-use/function-calling documentation.", think: "Should a repair-retry loop have a hard iteration limit? What's the actual cost of not having one?", miniTest: ["Name two distinct ways a tool call can be \u201cwrong\u201d even if it's syntactically valid JSON.", "Why is unbounded retry dangerous in an agent loop?", "What's the difference between validating a schema and validating semantic correctness?", "Give one real reason a model might call the wrong tool even with a correct schema.", "What should happen when the repair loop's retry limit is hit?"], answers: ["Valid JSON but wrong parameter values, or a call to a tool that doesn't fit the current step's actual need.", "It can loop indefinitely, burn cost/latency, and mask a bug that should be surfaced, not silently retried forever.", "Schema validation checks structure/types; semantic validation checks whether the content actually makes sense for the task.", "Ambiguous or overlapping tool descriptions confuse the model about which tool applies.", "Fail loudly and explicitly — surface the failure to the user/logs rather than guessing or looping further."], output: "Updated script with validation + bounded retry; a short failure-mode taxonomy checked into the repo.", checkpoint: "Explain, without notes, why a hard iteration limit is a safety feature, not just an efficiency one." },
      { day: 3, week: 1, objective: "Understand agent memory — what \u201cmemory\u201d actually means computationally.", study: "Context-window-as-short-term-memory vs. external long-term memory; embedding-based retrieval as memory; memory vs. RAG.", materials: ["Docs: Chroma or FAISS getting-started guide (pick one)", "Paper: Lewis et al., \u201cRetrieval-Augmented Generation for Knowledge-Intensive NLP Tasks\u201d (2020) — architecture diagram"], deepWork: "Design, on paper, a memory architecture for an agent that must remember facts across a week of separate conversations without re-feeding full history every time.", build: "A minimal embedding + retrieval memory store using a local embedding model — no managed vector-DB service required.", read: "The RAG paper's introduction and architecture section.", think: "What's the difference between an agent that \u201cremembers\u201d something and one that just has it in a long context window? Does the distinction matter for correctness?", miniTest: ["What does \u201clong-term memory\u201d mean for an LLM agent, computationally?", "Why can't you just keep the entire conversation history in context forever?", "What's semantic/embedding-based retrieval doing, at a high level?", "Name one risk of retrieval-based memory.", "Is RAG the same thing as \u201cmemory\u201d? Why or why not?"], answers: ["Usually: information stored outside the context window (a database) and pulled back in when relevant.", "Context windows are finite and cost scales with length; irrelevant history also degrades attention/accuracy.", "Converting text to vectors and finding the nearest vectors to a query — an approximate similarity search.", "Retrieving the wrong or outdated memory and presenting it as current fact (\u201cstale memory\u201d bugs).", "Related but not identical — RAG is one specific pattern (retrieve-then-generate) for implementing memory, not the only one."], output: "Working minimal memory store; a design doc (diagram + ~150 words) for a week-long-memory agent.", checkpoint: "Draw the retrieve-then-generate flow from memory, on paper." },
      { day: 4, week: 1, objective: "Understand multi-agent coordination patterns and when they're actually justified.", study: "Single-agent-with-tools vs. multi-agent orchestration (planner/worker, debate, hierarchical delegation); real coordination costs.", materials: ["Paper: a recent multi-agent-LLM survey on arXiv (search \u201cmulti-agent LLM survey 2025\u201d, pick the most-cited)", "Docs: one multi-agent framework's architecture docs (e.g. CrewAI or AutoGen) — studied for pattern, not adopted long-term"], deepWork: "Design one real task (\u201cresearch a topic and write a cited summary\u201d) two ways — single agent with tools, and a 3-agent researcher/writer/critic pipeline — and write the actual trade-offs.", build: "A minimal 2-agent pipeline from scratch: one agent drafts, a second critiques and sends it back for one revision round.", read: "One multi-agent architecture blog post from a real production engineering team.", think: "At what point does a second agent start hurting more than helping? What measurable signal would tell you you've crossed that line?", miniTest: ["Name one real cost of multi-agent systems beyond raw compute cost.", "What's a \u201ccritic\u201d pattern, and what does it protect against?", "When is a single agent with more tools a better choice than multiple agents?", "What makes multi-agent systems harder to debug than single-agent ones?", "Give one concrete metric that would detect multi-agent coordination failing."], answers: ["Coordination/communication overhead, harder debugging, latency stacking across agent hops.", "A second agent whose job is to check/critique the first — protects against unexamined, overconfident single-pass answers.", "When the task has no genuinely separable sub-roles — splitting adds overhead without real division of labor.", "Failures can originate in the interaction between agents, not any single agent's logic.", "E.g. rising back-and-forth revision rounds without convergence, or growing disagreement rate between agents."], output: "Working 2-agent draft/critique pipeline; a one-page trade-off write-up.", checkpoint: "Explain, unaided, one real production trade-off between single- and multi-agent design." },
      { day: 5, week: 1, objective: "Understand quantization — why it works, not just how to run the command.", study: "Numerical precision (FP32/FP16/INT8/INT4); why weights tolerate lower precision; the accuracy/size/speed trade-off curve.", materials: ["Paper: Jacob et al., \u201cQuantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference\u201d (2017)", "Paper: Frantar et al., \u201cGPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers\u201d (2023)", "Repo: ggerganov/llama.cpp — README + GGUF format documentation"], deepWork: "By hand, compute memory for a 1B-parameter model at FP32/FP16/INT8/INT4, and explain in your own words why INT4 doesn't destroy accuracy the way naive intuition suggests.", build: "Download a small open model (1-3B params) and quantize it to INT4 GGUF using llama.cpp's conversion tools; run one inference and record output.", read: "The GPTQ paper's abstract and results section.", think: "Whose accuracy loss matters more: a 2% average benchmark drop, or one catastrophic failure on a rare-but-important input? How would you even find out which one you're getting?", miniTest: ["Why does FP16 use half the memory of FP32?", "What's the core idea behind post-training quantization vs. quantization-aware training?", "Why don't neural networks need full FP32 precision to work well?", "What's one real risk of INT4 quantization beyond \u201caverage accuracy drops a bit\u201d?", "What does GGUF solve that a raw quantized weights file wouldn't?"], answers: ["Each number uses 16 bits instead of 32 — literally half the storage/bandwidth per weight.", "You quantize an already-trained model's weights after the fact, without retraining — faster/cheaper, some accuracy cost.", "Neural networks are inherently robust to small numerical noise — the same property that makes dropout work.", "Disproportionate accuracy loss on rare/edge-case inputs even when average benchmark accuracy looks fine — a tail-risk problem.", "It bundles weights, tokenizer, and metadata in one self-contained file so any compatible runtime can load and run it."], output: "Working INT4-quantized model + a written memory-arithmetic table (FP32/FP16/INT8/INT4).", checkpoint: "Do the memory-size arithmetic for a model size you pick, from memory, on paper." },
      { day: 6, week: 1, objective: "Get a quantized model actually running inside an Android app skeleton.", study: "Android's on-device ML runtime landscape — LiteRT (TensorFlow Lite), ONNX Runtime Mobile, MLC-LLM, and NNAPI as the hardware-abstraction layer.", materials: ["Docs: Google's LiteRT (TensorFlow Lite) Android quickstart", "Repo: mlc-ai/mlc-llm — Android deployment guide", "Docs: Android Neural Networks API developer guide"], deepWork: "Diagram the full path a prompt takes from your app's UI thread to the NPU and back — every layer crossed.", build: "In Android Studio (build on ANCHOR's architecture or start fresh), get a small quantized model loaded and producing one real on-device inference result.", read: "The LiteRT Android quickstart guide, end to end.", think: "What's the actual argument for running an agent partly on-device vs. calling a cloud API for everything? Where's the real trade-off line?", miniTest: ["What does NNAPI abstract over, and why does that matter for portability?", "Name one reason on-device inference can be faster than a cloud API call, and one reason it can be slower.", "What's the difference between LiteRT/TFLite and a raw GGUF file, functionally?", "Why might battery consumption, not raw speed, be the actual bottleneck for on-device agent use?", "What's one privacy/latency argument for on-device a cloud-only architecture can't offer at all?"], answers: ["It abstracts over different chipsets' NPUs/DSPs so app code doesn't need per-hardware special-casing.", "Faster: no network round-trip; slower: mobile compute is far less powerful than a data-center GPU.", "LiteRT/TFLite is a full runtime+format+API; GGUF is a file format a different runtime (llama.cpp) loads and executes.", "Sustained inference still drains battery and generates heat, which throttles performance over time.", "Data genuinely never leaves the device — categorically different from \u201cencrypted in transit.\u201d"], output: "Working on-device inference demo + the path diagram checked into the repo.", checkpoint: "Trace the full inference path (app \u2192 NPU \u2192 back) from memory." },
      { day: 7, week: 1, objective: "Week 1 review and foundation exam.", study: "Re-read your own Day 1-6 written notes and diagrams — test retained understanding, not the source materials.", materials: ["Your own Day 1-6 repo and notes"], deepWork: "Attempt the Week 1 exam below closed-book.", build: "N/A — review day.", read: "Your own week's commit history.", think: "Which day's concept do you understand least confidently, and why?", miniTest: ["See the Week 1 Exam below."], answers: ["See the Week 1 Exam below."], output: "Completed Week 1 Exam.", checkpoint: "Pass your own honest read of the exam's grading rubric." },
    ],
    exam: {
      id: "week1", title: "Week 1 Exam — Foundation Exam",
      gradingNote: "MCQs need 2/3 correct. Short answers graded on sound reasoning. Coding/debugging/design graded on whether the fix addresses the real failure mode, not on polish. The open-ended question is graded on whether you use your own week's evidence, not generic talking points.",
      questions: [
        { type: "MCQ", prompt: "In the ReAct loop, \u201cObserve\u201d refers to:", options: ["The model reading its own weights", "The model reading a tool's output", "A human reviewing the model's plan", "The training data"] },
        { type: "MCQ", prompt: "INT4 quantization primarily trades:", options: ["Latency for cost", "Numerical precision for memory/speed", "Accuracy for training time", "Context length for batch size"] },
        { type: "MCQ", prompt: "NNAPI's main purpose is to:", options: ["Train models on-device", "Abstract hardware accelerators for inference", "Manage app permissions", "Compress APK size"] },
        { type: "Short answer", prompt: "Explain why an unbounded tool-call retry loop is a safety risk, not just an efficiency one." },
        { type: "Short answer", prompt: "Explain the actual difference between \u201cmemory\u201d and \u201cRAG\u201d for an LLM agent." },
        { type: "Quantitative", prompt: "A model has 2 billion parameters. Compute its memory footprint at FP32, FP16, and INT4 (show your work)." },
        { type: "Coding", prompt: "Write pseudocode for call_tool_with_repair(model, tool_call, max_retries) that validates schema, retries once with the model on failure, and fails loudly after max_retries." },
        { type: "Debugging", prompt: "A broken agent loop calls a tool, gets a malformed JSON response, and silently proceeds using None for every field. Identify the bug class and propose a fix." },
        { type: "System design", prompt: "Design a memory system for an agent used daily over a month by the same user — what's stored, what's retrieved, what's ever deleted, and why?" },
        { type: "Open-ended", prompt: "Argue, using this week's own material, which pattern (single-agent or 2-agent draft/critique) you'd choose for a \u2018review my code\u2019 task — and what would change your answer.", requiresOwnEvidence: true },
      ],
    },
  },
  {
    week: 2, title: "Technical depth — agent framework from scratch + evaluation + real quantization",
    days: [
      { day: 8, week: 2, objective: "Build a complete, framework-free agent loop end to end.", study: "Consolidating Week 1 into one coherent system: planning, tool-calling, memory, and a stop condition.", materials: ["Your own Week 1 code (synthesis day)", "Reread the ReAct paper with the full system in mind"], deepWork: "Write the full state machine for your agent on paper before coding: states, transitions, every exit condition.", build: "A complete minimal agent — plans, calls at least two tools, retrieves from memory, stops correctly — zero framework dependencies.", read: "Your own Day 1-6 code, critically, as if reviewing a stranger's PR.", think: "What's the smallest possible agent that could still honestly be called \u2018agentic\u2019 rather than \u2018a function with an if-statement\u2019?", miniTest: ["What are the mandatory components of something you'd call an \u201cagent\u201d rather than a script?", "Why write this without a framework at all, even once?", "What's a legitimate stop condition besides \u201ctask complete\u201d?", "What's the risk of an agent with no maximum step count?", "Where does state actually live in your implementation?"], answers: ["Some capacity to reason about what to do next, take an action via a tool, and incorporate the result.", "So you understand exactly what a framework abstracts away later — you can't judge trade-offs you've never built.", "Reaching a max-step limit, a user cancellation, or detecting the same failure repeating.", "It can run forever (or until a cost/rate limit) on a task it can't solve, burning money and possibly taking harmful repeated actions.", "In your own explicit state object/variable — not implicitly scattered across prompt history."], output: "A single working agent script, framework-free, with a README explaining its state machine.", checkpoint: "Draw your agent's full state machine from memory." },
      { day: 9, week: 2, objective: "Harden the tool-execution layer — sandboxing and permissions.", study: "Why \u201cthe model decided to call a tool\u201d and \u201cthe tool ran with full system access\u201d should never be the same trust boundary; least-privilege design.", materials: ["OWASP Top 10 for LLM Applications — Excessive Agency and Insecure Output Handling sections", "Python subprocess sandboxing options / lightweight container approach"], deepWork: "For every tool your Day 8 agent can call, write the worst-case if it's called with malicious/wrong parameters, and design one mitigation each.", build: "Add a permissions layer: each tool declares what it may touch (read-only file access, allowlisted network calls) enforced outside the model's control.", read: "OWASP Top 10 for LLM Applications, \u201cExcessive Agency\u201d section, in full.", think: "If you can't fully sandbox a tool that genuinely needs to send an email, what's your second line of defense?", miniTest: ["Why shouldn't \u201cthe model was instructed not to do X\u201d count as a security control?", "What does least-privilege mean applied to a tool an agent can call?", "Give an example of a tool fine to auto-execute vs. one that should require human confirmation.", "What's \u201cexcessive agency\u201d in the OWASP framing?", "What's a concrete second line of defense for an irreversible action a tool must be able to perform?"], answers: ["Prompts are not enforcement — a sufficiently adversarial input can get the model to ignore instructions; real controls live in code the model can't talk its way around.", "The tool only does the minimum it needs — a weather-lookup tool shouldn't also have file-write access.", "Fine: a read-only lookup. Requires confirmation: sending an email, deleting a file, making a purchase.", "Giving an agent more capability/autonomy than the task or trust level actually warrants.", "A human-confirmation step, a rate limit, or a reversible staging step (draft-then-send) before the irreversible action."], output: "Permissions-enforced agent + a written per-tool risk table.", checkpoint: "Explain, unaided, why \u201cthe prompt tells it not to\u201d isn't a security boundary." },
      { day: 10, week: 2, objective: "Build a real evaluation harness for your agent — beyond \u201cit seemed to work.\u201d", study: "What agent benchmarks measure (success rate, step efficiency, cost, safety-violation rate); a demo vs. a benchmark.", materials: ["Paper: Liu et al., \u201cAgentBench: Evaluating LLMs as Agents\u201d (2023) — methodology section", "Paper: Mialon et al., \u201cGAIA: A Benchmark for General AI Assistants\u201d (2023) — difficulty-level structure"], deepWork: "Design 10 test cases for your own agent: 3 easy, 4 medium/realistic, 3 adversarial-or-edge-case designed to break it.", build: "An automated eval script running all 10 cases, reporting success rate, average steps, and safety-guardrail triggers — no manual eyeballing.", read: "The AgentBench paper's methodology section.", think: "Your agent passes 8/10 tests. Is that good? What's missing before you can answer honestly?", miniTest: ["Why is \u201cit worked when I tried it\u201d not the same as evaluation?", "What's a \u201csuccess rate\u201d metric actually measuring, and what can it hide?", "Name one reason step-count (efficiency) matters, not just pass/fail.", "Why should adversarial test cases be required, not optional?", "What would make an 8/10 score meaningless without more context?"], answers: ["One manual run is a single anecdote with selection bias — you test cases you expect to work.", "How often it succeeds on your specific test set, which can hide which failures matter more.", "An agent taking 20 wasteful steps for a 3-step task is expensive and slower even when it \u2018succeeds.\u2019", "Without deliberately trying to break it, you only learn behavior on inputs you already expected.", "Not knowing which 2 failed, how severe, or whether the test set is representative of real usage."], output: "Working automated eval harness with a results report checked into the repo.", checkpoint: "Explain, unaided, why pass/fail rate alone is an insufficient evaluation metric." },
      { day: 11, week: 2, objective: "Understand agent-specific attack surfaces and build basic guardrails.", study: "Prompt injection (direct/indirect); tool-call hijacking; cross-agent exploitation; a bug vs. an adversarial attack.", materials: ["OWASP Top 10 for LLM Applications, \u201cPrompt Injection\u201d section", "MITRE ATLAS (Adversarial Threat Landscape for AI Systems) — browse relevant tactics", "Simon Willison's writing on indirect prompt injection (at least one post)"], deepWork: "Design (don't necessarily execute) an indirect-injection scenario against your own Day 8 agent via untrusted tool output.", build: "Add an input-sanitization/trust-boundary layer: untrusted tool outputs get tagged as \u201cdata, not instructions\u201d before re-entering the model's context.", read: "One full Simon Willison post on indirect prompt injection.", think: "Can prompt injection ever be fully solved with prompting alone, or does it need an architectural solution like Day 9's sandboxing? Defend with this week's material.", miniTest: ["What's the difference between direct and indirect prompt injection?", "Why is a tool fetching untrusted external content higher-risk than one that doesn't?", "What does \u201ctagging data as data, not instructions\u201d actually protect against?", "Why might prompting alone be an incomplete defense?", "How does Day 9's sandboxing connect to Day 11's injection defense?"], answers: ["Direct: attacker types the instruction into chat. Indirect: it's hidden inside content the agent later reads.", "Its returned content is attacker-influenceable and gets fed back into context, where it can be mistaken for an instruction.", "Reduces (doesn't eliminate) the chance the model treats untrusted content as a command.", "Prompting is a request to the model's behavior, not an enforced boundary — a crafted injection can still override it.", "Complementary: prompting reduces the chance of a bad action; sandboxing limits the damage if it happens anyway — defense in depth."], output: "Injection-hardened agent + a one-page threat model document.", checkpoint: "Explain defense in depth for agent security using your own Day 9 and Day 11 work." },
      { day: 12, week: 2, objective: "Do a real, complete quantization pipeline on a model you'll actually use later.", study: "The practical GGUF workflow: convert \u2192 quantize \u2192 benchmark \u2192 decide if the trade-off is acceptable.", materials: ["ggerganov/llama.cpp conversion scripts and quant-type docs (Q4_K_M, Q5_K_M, etc.)", "llama-bench for tokens/second and memory measurement"], deepWork: "Quantize the same base model at two levels (e.g. Q4 and Q8), run Day 10's eval harness against both, compare quantitatively.", build: "A repeatable quantization pipeline: given a base model, produce a quantized GGUF at a specified level and auto-run your eval harness, outputting a comparison table.", read: "llama.cpp's docs on quantization-type naming conventions.", think: "Given your own measured numbers today, which quantization level would you actually ship, and why?", miniTest: ["What's the practical difference between Q4 and Q8, in your own measured terms today?", "Why benchmark accuracy and speed, not just one?", "What would make you choose a larger, more accurate quant level despite the size cost?", "What does a repeatable pipeline protect against that a one-off manual quantization wouldn't?", "Why is \u201csmaller is always better\u201d not true for on-device deployment?"], answers: ["Use your own real measured numbers — that's the point of the exercise.", "A model can be fast but too inaccurate, or accurate but too slow/large — you need both to decide.", "If your use case can't tolerate the accuracy drop (a safety-critical judgment call), the larger model's cost is justified.", "Redoing manual, error-prone steps for every new base model or quant level — and reproducibility.", "Below a certain size, accuracy loss can become severe enough the model is fast but useless — there's a real floor."], output: "Repeatable quantization pipeline + a real comparison table (your own numbers).", checkpoint: "State your own measured accuracy/speed trade-off numbers and which one you'd ship." },
      { day: 13, week: 2, objective: "Get your quantized, evaluated model actually integrated into your Android app.", study: "Real integration concerns: model loading time, memory pressure on a real device, graceful fallback if the device can't handle it.", materials: ["Your chosen runtime's production/app-integration guide (memory-management sections)", "Your own Day 12 quantized model output"], deepWork: "List every way this integration could fail on a real phone (OOM, unsupported chipset, APK size limits, thermal throttling) and design one fallback for each.", build: "Integrate the Day 12 quantized model into the Day 6 app skeleton, with at least one working fallback path (e.g. cloud API if on-device loading fails).", read: "Your chosen runtime's production/app-integration guide, memory sections.", think: "How would the app (or you) actually know a fallback triggered on a real user's device you can't see? What telemetry do you need?", miniTest: ["Why does emulator testing alone give false confidence about real-device performance?", "Name one reason a model might fail to load on a real device but not your dev machine.", "What's a reasonable fallback if on-device inference isn't available?", "Why does APK size matter for model file distribution?", "What minimum telemetry tells you your fallback path works correctly in the field?"], answers: ["Emulators often have more generous RAM/CPU and don't replicate real chipset NPU/thermal behavior.", "Insufficient free RAM on a low-end device, or an incompatible/older chipset lacking needed NPU features.", "Route to a cloud API instead, with a clear indication to the user if the privacy distinction matters.", "Large model files bloat download size, which measurably hurts install/uninstall rates.", "A logged event (with device info, not user content) whenever the fallback triggers, so you can see fallback rate by device type."], output: "Working on-device-with-fallback integration + a telemetry logging stub.", checkpoint: "List, from memory, the failure modes you designed fallbacks for." },
      { day: 14, week: 2, objective: "Week 2 review and technical exam.", study: "Consolidate Days 8-13.", materials: ["Your own Week 2 repo"], deepWork: "Attempt the Week 2 exam closed-book.", build: "N/A — review day.", read: "Your own week's commit history.", think: "Which Week 2 decision are you least sure was correct?", miniTest: ["See the Week 2 Exam below."], answers: ["See the Week 2 Exam below."], output: "Completed Week 2 Exam.", checkpoint: "Defend your quantization and security choices using your own real numbers." },
    ],
    exam: {
      id: "week2", title: "Week 2 Exam — Technical Exam",
      gradingNote: "Short answers graded on referencing your own project work, not generic textbook phrasing — this exam specifically checks internalization via your own evidence.",
      questions: [
        { type: "MCQ", prompt: "Least-privilege tool design means:", options: ["Giving every tool full access for simplicity", "Giving each tool only the access it strictly needs", "Requiring human approval for every tool call", "Disabling tools entirely"] },
        { type: "MCQ", prompt: "Indirect prompt injection differs from direct injection in that:", options: ["It's less dangerous", "It comes from content the agent reads, not the user's own message", "It only affects multi-agent systems", "It's a training-time attack"] },
        { type: "Short answer", prompt: "Explain why \u201cthe prompt told it not to\u201d is not a real security control." },
        { type: "Short answer", prompt: "Explain why pass/fail rate alone is an insufficient agent-evaluation metric — reference your own Day 10 work.", requiresOwnEvidence: true },
        { type: "Quantitative", prompt: "Using your own Day 12 measured numbers, compute the percentage size reduction and accuracy change between your two quantization levels.", requiresOwnEvidence: true },
        { type: "Coding", prompt: "Write pseudocode for a tool-output sanitization function that tags untrusted content before it re-enters the model's context." },
        { type: "Debugging", prompt: "Your eval harness reports 100% pass rate, but users report frequent real-world failures. List three plausible reasons, grounded in this week's material." },
        { type: "System design", prompt: "Design the fallback architecture for an on-device agent when: the device can't run the model, the model times out, and the network fallback is also unavailable. What's the final failure state, and is it acceptable?" },
        { type: "Open-ended", prompt: "Using your own measured quantization data and your own security threat model, argue for the specific quantization level and security posture you'd actually ship — an actual decision, not a hedge.", requiresOwnEvidence: true },
      ],
    },
  },
  {
    week: 3, title: "Engineering & Project — combine everything into one real hybrid system",
    days: [
      { day: 15, week: 3, objective: "Design the full hybrid on-device/cloud agent architecture — the actual flagship system.", study: "Routing logic design: what determines on-device vs. cloud per agent step (task complexity, privacy sensitivity, latency, device capability, cost).", materials: ["Your own Weeks 1-2 artifacts (synthesis/design day)"], deepWork: "Write the full routing decision logic on paper as a flowchart: what signals determine on-device vs. cloud, in what priority order?", build: "A written architecture document (components, data flow, failure modes, security boundaries) for the system you'll build the rest of this week.", read: "Your own Week 1-2 READMEs and design docs, as if onboarding onto someone else's project.", think: "What's the single hardest engineering decision in this whole system, and why haven't you already made it by accident?", miniTest: ["Name three signals that should influence the on-device-vs-cloud routing decision.", "Why might a \u2018simple\u2019 task still be routed to the cloud?", "Why might a \u2018complex\u2019 task still be routed on-device?", "What's a failure mode specific to routing itself, not either execution path?", "What does the \u2018hardest decision\u2019 Think question exist to surface?"], answers: ["Task complexity/accuracy requirement, privacy sensitivity, device capability/battery, network availability, cost.", "If it needs a capability (large context window, specific tool) only the cloud model reliably supports.", "If it involves sensitive data that shouldn't leave the device regardless of difficulty.", "The router misclassifying a step and sending it down the wrong path — a bug in the decision itself.", "It forces you to name the real architectural risk explicitly before discovering it mid-build when it's costlier to fix."], output: "A full written architecture document (diagrams welcome) for your flagship project.", checkpoint: "Walk through your architecture diagram from memory, end to end." },
      { day: 16, week: 3, objective: "Build the routing layer itself.", study: "Implementing the Day 15 design as real, testable code.", materials: ["Your own Day 15 architecture document"], deepWork: "Before coding, write 5 concrete test cases for the router alone — inputs and expected routing decisions.", build: "The routing layer: given a task/step description and device/network state, it outputs a routing decision and logs why.", read: "N/A — re-read your own Day 15 doc before starting.", think: "Should the routing decision ever be overridable by the user directly? What would that mean for privacy-sensitive routing?", miniTest: ["Why does the router need to log its reasoning, not just its decision?", "What's a test case that should force cloud routing, and one that should force on-device?", "What happens if the router itself has a bug that misroutes sensitive data to the cloud?", "Why write test cases before writing the router's code?", "Is a hard-coded rule set or a learned router more appropriate at your project's current scale, and why?"], answers: ["So failures can be diagnosed later — \u2018it routed wrong\u2019 is far less useful than \u2018it routed wrong because it misjudged network state.\u2019", "Cloud-forcing: needs a capability only the larger model has. On-device-forcing: involves privacy-sensitive data.", "It's a serious privacy bug — the exact failure the hybrid architecture was supposed to prevent.", "It forces you to define correct behavior precisely before writing code that \u2018sort of works\u2019 without a clear spec.", "A hard-coded rule set — auditable, debuggable, doesn't need training data you don't have; a learned router adds complexity without clear benefit yet."], output: "Working, tested routing layer with decision logging.", checkpoint: "Explain your routing logic's priority order from memory." },
      { day: 17, week: 3, objective: "Integrate the full agent (Weeks 1-2) with the routing layer inside the real Android app.", study: "Real integration engineering: where clean architecture pays off, or exposes earlier technical debt.", materials: ["All of your own repo so far"], deepWork: "Before touching code, name every place where Week 1-2's \u2018quick and dirty\u2019 decisions will now cause friction integrating with the Android app.", build: "The full integrated system: task \u2192 agent plans \u2192 router decides per step \u2192 tools execute (sandboxed) \u2192 response — end to end, inside the app.", read: "N/A — integration day.", think: "What's the actual user-facing difference this makes, in one sentence a non-technical person would understand and care about?", miniTest: ["Why does clean separation between agent logic and UI matter for this integration step specifically?", "Name one piece of Week 1-2 technical debt you had to pay down today.", "What's your honest one-sentence answer to today's Think question?", "What's one thing that worked in isolation but broke in integration, and why?", "What would you do differently starting over, knowing what you know now?"], answers: ["Project-specific — answer honestly from your actual day; this is a reflection check, not a knowledge check.", "Project-specific.", "Project-specific.", "Project-specific.", "Project-specific — if you can't answer these from your own work, slow down before Day 18."], output: "A working end-to-end demo inside the real Android app — record a short screen capture.", checkpoint: "Give the one-sentence non-technical explanation out loud to someone outside CS." },
      { day: 18, week: 3, objective: "Add real observability — logging, telemetry, and evaluation hooks into the live pipeline.", study: "Debug prints vs. production-grade observability (structured logs, correlation IDs, metrics worth alerting on).", materials: ["Any structured-logging library's docs for your stack", "Your own Day 10 eval harness, extended to the live integrated system"], deepWork: "Design a correlation-ID scheme: trace one task spanning planning \u2192 routing \u2192 multiple tool calls \u2192 response as one coherent unit in logs.", build: "Structured logging with a correlation ID per task run, plus Day 10's eval harness re-run against the fully integrated system.", read: "N/A — build/instrumentation day.", think: "If this were a real production app with real users tomorrow, what's the first metric you'd want on a dashboard, and why that one first?", miniTest: ["What's a correlation ID, and what problem does it solve?", "Why is \u2018print statements\u2019 insufficient for a multi-step agent system in production?", "Name one metric you'd want alerted on automatically, not just logged.", "Why re-run your eval harness against the integrated system, not just the standalone Week 2 agent?", "What's your honest answer to today's Think question, for your specific project?"], answers: ["A unique identifier attached to every log line for one task run, letting you reconstruct the full multi-step trace.", "Not structured, not correlated across steps, not queryable/aggregable at scale.", "E.g. fallback-path trigger rate, tool-call failure rate, or safety-guardrail trigger rate.", "Integration can introduce new failure modes (routing bugs, Android memory pressure) the standalone agent test never exercised.", "Project-specific — answer honestly."], output: "Fully instrumented pipeline + eval harness results against the integrated system.", checkpoint: "Explain your correlation-ID scheme from memory." },
      { day: 19, week: 3, objective: "A dedicated security-hardening pass on the integrated system, not just the standalone agent.", study: "Integration often reopens security holes closed in isolation — revisit Day 9/11 mitigations in the integrated context.", materials: ["Your own Day 9 and Day 11 threat models, reread specifically for \u2018does this still hold now that it runs inside a real app with a router?\u2019"], deepWork: "Re-run your Day 11 injection scenario against the integrated system — does the router introduce a new attack surface (e.g. tricking it into sending sensitive data to the cloud path)?", build: "Patch new gaps found; add a dedicated security test suite (distinct from Day 10's functional suite) that tries to break sandboxing, routing, and injection defenses together.", read: "N/A — security-focused build day.", think: "Security never \u2018finishes\u2019 — what's your honest criterion for \u2018hardened enough to demo/ship this version\u2019 today, given real time constraints?", miniTest: ["Why can integration reopen security issues \u2018solved\u2019 in isolation?", "What's a new attack surface specifically introduced by the routing layer?", "Why does a security test suite need to be distinct from a functional correctness suite?", "Why is naming an explicit \u2018good enough for now\u2019 bar better than open-ended \u2018keep hardening forever\u2019?", "What's the single scariest gap you found today, and did you fix it or explicitly defer it?"], answers: ["Components interact in ways neither one's isolated tests covered.", "An attacker manipulating a task/tool output to influence the router into sending on-device-only data to the cloud path.", "Functional tests check \u2018does it do the right thing\u2019; security tests check \u2018can it be made to do the wrong thing on adversarial inputs.\u2019", "An open-ended goal never actually gets marked done, which in practice means indefinite deprioritization.", "Project-specific — it's fine (expected) to defer something explicitly as long as you document why and the residual risk."], output: "Patched system + a dedicated security test suite + an explicit \u2018known limitations / deferred risks\u2019 README section.", checkpoint: "State your \u2018good enough for now\u2019 security bar and defend it, unaided." },
      { day: 20, week: 3, objective: "Real performance profiling on-device — battery, latency, memory, not just \u2018it works.\u2019", study: "Android Studio Profiler (CPU, Memory, Energy); a realistic sustained-use test vs. a single happy-path demo.", materials: ["Android Studio's Profiler documentation (CPU, Memory, Energy tabs)", "Your own integrated app from Days 17-19"], deepWork: "Design a sustained-use test protocol (e.g. 10 agent tasks over 10 minutes) that would reveal thermal throttling, memory leaks, or battery drain a single demo run wouldn't show.", build: "Run the sustained-use test on a real device (not just emulator) using the Profiler; capture real numbers — battery %, memory over time, latency distribution including P95, not just average.", read: "N/A — profiling day.", think: "Your P95 latency is probably much worse than your average — why does that matter more for real user experience?", miniTest: ["Why is a single demo run insufficient to catch memory leaks or thermal throttling?", "What does P95 latency mean, and why can it differ dramatically from average?", "Name one real device-specific factor a profiler reveals that an emulator can't.", "Why measure battery drain specifically, not just speed?", "State your own actual measured P95 latency and battery-drain-per-task from today."], answers: ["These effects accumulate over sustained use — a single fast, cool run won't show behavior after the 8th or 20th inference.", "The latency below which 95% of requests fall — a small number of very slow outliers can badly hurt perceived experience.", "Real thermal throttling, real battery/power-management interaction, real chipset-specific NPU driver quirks.", "A fast model that drains battery unacceptably fast gets uninstalled regardless of raw speed.", "Project-specific — use your real numbers; that's the point."], output: "A real performance report (numbers + one chart, even hand-drawn) checked into the repo.", checkpoint: "State your own measured P95 latency and battery numbers, from memory." },
      { day: 21, week: 3, objective: "Week 3 review and engineering/project exam.", study: "Consolidate Days 15-20.", materials: ["Your own Week 3 repo"], deepWork: "Attempt the Week 3 exam closed-book.", build: "N/A — review day.", read: "Your own week's commit history.", think: "Where did the real build diverge most from your Day 15 plan?", miniTest: ["See the Week 3 Exam below."], answers: ["See the Week 3 Exam below."], output: "Completed Week 3 Exam.", checkpoint: "Defend your architecture using your own real security and performance findings." },
    ],
    exam: {
      id: "week3", title: "Week 3 Exam — Engineering/Project Exam",
      gradingNote: "Graded almost entirely on whether your answers use your actual project's real data and findings — generic, textbook-correct answers that don't reference your own numbers/architecture score as incomplete this week specifically.",
      questions: [
        { type: "MCQ", prompt: "A correlation ID's primary purpose is to:", options: ["Encrypt logs", "Let you reconstruct one full multi-step run across log lines", "Speed up inference", "Authenticate users"] },
        { type: "MCQ", prompt: "P95 latency measures:", options: ["Average speed", "The slowest 5% of requests", "95% memory usage", "Battery percentage at 95% charge"] },
        { type: "Short answer", prompt: "Using your own Day 19 findings, explain one specific way integration reopened a security gap that was closed in an isolated component.", requiresOwnEvidence: true },
        { type: "Quantitative", prompt: "State your own measured P95 latency, average battery drain per task, and memory footprint from Day 20, with brief interpretation of whether these are acceptable for a real user.", requiresOwnEvidence: true },
        { type: "Coding", prompt: "Write pseudocode for the routing decision function, including logging of why it made each decision." },
        { type: "Debugging", prompt: "Your system passes all Week 2 standalone-agent tests but fails a new integration test where sensitive data gets routed to the cloud. Identify the most likely root cause and the fix." },
        { type: "System design", prompt: "Sketch your flagship's current architecture as it actually exists after Day 20 (not as planned on Day 15) — note anywhere the real build diverged and why.", requiresOwnEvidence: true },
        { type: "Open-ended", prompt: "Using your own real measured data (security findings + performance numbers), argue whether this system is ready to demo as \u2018production-quality thinking,\u2019 or what specifically needs to change first.", requiresOwnEvidence: true },
      ],
    },
  },
  {
    week: 4, title: "Expert Synthesis — benchmarking, research literacy, polish, portfolio",
    days: [
      { day: 22, week: 4, objective: "Build a formal, multi-dimensional benchmark suite for your finished system.", study: "A genuinely rigorous benchmark report: multiple metrics, confidence intervals or multiple runs, a clearly stated methodology.", materials: ["Your own Days 10, 12, 18, 20 measurement work, combined into one report", "Reread AgentBench and GAIA methodology sections as the standard to hold yourself to"], deepWork: "Write the methodology section before running final numbers: what exactly is measured, how many runs, what counts as a pass, what's excluded and why.", build: "Run your full test suite (functional + security + performance) at least 3 times per case and compute real statistics (mean, range/std-dev), not single-run numbers.", read: "N/A — analysis day.", think: "If a recruiter or professor asked \u2018how confident are you in these numbers,\u2019 what would you actually say, honestly, given your sample size?", miniTest: ["Why does running each test case multiple times matter more than running it once?", "What should a methodology section state that raw numbers alone don't?", "What's an honest limitation of a benchmark run on your own devices/data that you should state explicitly?", "Why write the methodology before the final numbers, not after?", "What's your own honest answer to today's Think question?"], answers: ["A single run can be an outlier; multiple runs show real variance and avoid overstating confidence in a lucky/unlucky result.", "What exactly was measured, how, on what hardware/data, and what was excluded — without this, numbers are hard to interpret or reproduce.", "Small sample sizes, testing on your own device(s) only, and test cases you personally designed (possible unconscious bias).", "It prevents unconsciously shaping the methodology to produce better-looking final numbers after the fact.", "Project-specific — answer honestly, including real uncertainty."], output: "A complete, honest benchmark report with real methodology and real multi-run statistics.", checkpoint: "State your top 3 benchmark numbers and their real confidence caveats, from memory." },
      { day: 23, week: 4, objective: "Run ablation studies — isolate what each design decision actually contributed.", study: "What an ablation study is, and why it's the difference between \u2018I built a system\u2019 and \u2018I understand why my system works.\u2019", materials: ["Your own system's components — no new external material today"], deepWork: "List every major design decision (routing, sandboxing, quantization level, memory retrieval) and predict, before testing, what happens if you remove or degrade each.", build: "Run your Day 22 benchmark suite with each major component individually disabled/degraded, and compare against your full-system baseline.", read: "N/A — experimental day.", think: "Which ablation result surprised you most — where your prediction was wrong? What does that tell you about your own understanding of your own system?", miniTest: ["What is an ablation study, in one sentence?", "Why predict the outcome before running the ablation, rather than explaining afterward?", "What does it mean if disabling a component you thought was critical barely changes performance?", "What does it mean if a component you considered minor turns out to matter a lot?", "What's your own honest answer to today's Think question?"], answers: ["Systematically removing/degrading one component at a time to measure its individual contribution to overall performance.", "Post-hoc explanation is vulnerable to rationalizing whatever happened; predicting first genuinely tests understanding.", "Either the component wasn't doing what you thought, or your test cases don't exercise the scenario where it matters.", "It reveals a load-bearing design decision you may have under-appreciated or under-documented.", "Project-specific — answer honestly."], output: "A completed ablation table (component removed vs. metric impact).", checkpoint: "State, from memory, which single component contributed most to overall performance, and how you know." },
      { day: 24, week: 4, objective: "Write the real technical report — the document that turns a repo into evidence of understanding.", study: "What separates a tutorial-follower's README from a real technical report: problem, related work, architecture, methodology, results, limitations, future work.", materials: ["Your own repo's full history — a writing day"], deepWork: "Outline the report's full structure before writing prose — get every section's key point down as a single bullet before expanding any of them.", build: "The full technical report (1,500-3,000 words is reasonable), including real benchmark/ablation data and an honest, specific limitations section.", read: "One well-written technical report or engineering-blog deep-dive as a structural model (not a tutorial).", think: "What's the one limitation you're most tempted to downplay or omit — and why should you include it anyway?", miniTest: ["Why does a \u2018limitations\u2019 section make a report more credible, not less?", "What's the difference between \u2018future work\u2019 and \u2018things I didn't get around to\u2019?", "Why include real ablation/benchmark numbers rather than describing the system qualitatively?", "What's one sign a report was written by someone who followed a tutorial vs. someone who understood the system?", "What's your own honest answer to today's Think question?"], answers: ["It signals real understanding of the system's boundaries — an unqualified success claim reads as naive or dishonest.", "Future work should be a genuine, specific next step, not a vague catch-all for unfinished business.", "Numbers are falsifiable and specific; qualitative description alone lets vague claims pass unchallenged.", "The presence (or absence) of genuine trade-off reasoning, real measured numbers, and an honest limitations section.", "Project-specific — the instinct to omit it is exactly the signal it belongs in the report."], output: "Complete technical report checked into the repo as the project's centerpiece document.", checkpoint: "Summarize your report's core contribution in 2 sentences, from memory, without re-reading it." },
      { day: 25, week: 4, objective: "Research literacy — read and partially reproduce a recent piece of real agent-evaluation research.", study: "How to read a paper critically: the claim, the evidence, what would make you doubt it.", materials: ["arXiv (cs.AI/cs.CL) — a 2025-2026 paper on agent evaluation, agent security, or on-device LLM inference with available code"], deepWork: "Before reproduction, write down: the paper's central claim, their evaluation methodology, and the smallest piece of their result you could realistically attempt this week.", build: "Attempt to reproduce the smallest meaningful piece of their result using their code (if available) or your own reimplementation, at small scale.", read: "The full paper, at least twice — once for understanding, once tracing methodology against results.", think: "Where do you agree with the paper's conclusions, and where do you have a genuine, specific reservation?", miniTest: ["What's the paper's central claim, in one sentence, in your own words?", "What's their evaluation methodology, briefly?", "What did you actually manage to reproduce, and did your result match theirs?", "If it didn't match, what's your best hypothesis for why?", "What's your own genuine point of agreement or disagreement with their conclusions?"], answers: ["Paper-specific — must be answered from the actual paper you chose, not generically.", "Paper-specific.", "Paper-specific.", "Paper-specific.", "Paper-specific — this is the actual test of research literacy: can you state someone else's claim precisely and form your own judgment."], output: "A written reproduction report (what you attempted, what matched, what didn't, your critical take).", checkpoint: "State the paper's central claim and your own specific reservation about it, from memory." },
      { day: 26, week: 4, objective: "Make a real open-source contribution — not a cosmetic PR.", study: "How real open-source contribution works: finding an appropriate issue, understanding an unfamiliar codebase, getting a PR through review.", materials: ["An MCP server implementation, llama.cpp, MLC-LLM, or an agent-evaluation tool with open \u2018good first issue\u2019 tags"], deepWork: "Read enough of the target codebase's architecture (not just the one file you'll touch) to understand where your change fits, before writing any code.", build: "A real, submitted pull request — a genuine bug fix, doc improvement, or small feature, following the project's actual contribution guidelines.", read: "The target project's CONTRIBUTING.md, in full, before writing any code.", think: "What's the difference between a PR that gets merged easily and one that sits ignored for months? What did you do today to land in the first category?", miniTest: ["Why read CONTRIBUTING.md before writing code, not after?", "What makes a PR easy for a maintainer to review and merge quickly?", "Why is \u2018understanding the surrounding architecture\u2019 important even for a small fix?", "What's a realistic outcome today if your PR isn't merged immediately — and is that a failure?", "What's your own honest answer to today's Think question?"], answers: ["Ignoring contribution conventions is a common reason small PRs get ignored or rejected.", "Small, focused scope; tests included; clear commit message; existing code style; a clear explanation of why.", "A fix that technically works but doesn't fit the codebase's patterns creates review friction and maintenance burden.", "Review comments requesting changes, or a wait for maintainer availability — completely normal, not a failure.", "Project-specific — answer honestly."], output: "A submitted (not necessarily yet merged) pull request, linked in your README as evidence.", checkpoint: "Explain, unaided, what your PR changes and why it was needed." },
      { day: 27, week: 4, objective: "Polish — documentation, demo, and presentation quality pass.", study: "What makes a portfolio project land with a recruiter in the first 60 seconds (README structure, a working demo, clear visuals) vs. getting scrolled past.", materials: ["2-3 well-regarded open-source project READMEs, studied for structure only, not content"], deepWork: "Rewrite your top-level README with a strict structure: one-paragraph summary, demo GIF/video at the very top, architecture diagram, key results (your real numbers), how to run it, link to the full technical report.", build: "Record a clean demo video/GIF of the full system end to end; finalize the README; test that the repo actually runs cleanly from a fresh clone.", read: "N/A — polish day.", think: "If a recruiter spends exactly 90 seconds on your repo, what do they see, in order, and does that order actually make your best case first?", miniTest: ["Why does the demo need to be at the very top of the README, not the bottom?", "Why actually test a fresh clone rather than assuming it works?", "What's one thing about your project that's genuinely impressive but currently hard to notice quickly?", "Why does the architecture diagram need to appear early, not just in the technical report?", "What's your own honest 90-second-scan answer to today's Think question?"], answers: ["Most viewers decide whether to keep reading within seconds — burying the payoff loses the audience.", "Your own dev environment accumulates state that can hide missing setup steps a fresh user would hit immediately.", "Project-specific.", "Project-specific — but generally: it anchors understanding before the reader is asked to trust the numbers.", "Project-specific — answer honestly; today's checkpoint depends on genuine reflection."], output: "A polished, fresh-clone-tested repo with a demo at the top of the README.", checkpoint: "Do the 90-second scan yourself, honestly, as if you were a stranger — note anything you'd still change." },
      { day: 28, week: 4, objective: "Week 4 review and final expert-level synthesis exam.", study: "Consolidate Days 22-27.", materials: ["Your own Week 4 repo and technical report"], deepWork: "Attempt the Week 4 exam under something resembling interview pressure — have a friend, mentor, or yourself reading it cold a day later, question your answers.", build: "N/A — review day.", read: "Your own full technical report.", think: "Which decision in your finished system would you defend most confidently in an interview, and which would you defend least confidently?", miniTest: ["See the Week 4 Exam below."], answers: ["See the Week 4 Exam below."], output: "Completed Week 4 Exam.", checkpoint: "Defend every major decision in your finished system using real evidence generated this month." },
    ],
    exam: {
      id: "week4", title: "Week 4 Exam — Expert-Level Synthesis Exam",
      gradingNote: "Graded holistically: can you defend every major decision in your finished system using real evidence you generated this month, under something resembling interview pressure? Reciting the month's content without defending your own project's specific decisions is graded as incomplete.",
      questions: [
        { type: "MCQ", prompt: "An ablation study's purpose is to:", options: ["Speed up training", "Isolate each component's individual contribution to overall performance", "Reduce model size", "Improve UI design"] },
        { type: "MCQ", prompt: "A paper reproduction attempt that doesn't match the original result should lead you to:", options: ["Assume the paper is wrong", "Assume your own code is definitely broken", "Form a specific, testable hypothesis for the discrepancy", "Abandon the attempt without further analysis"] },
        { type: "Short answer", prompt: "Explain why writing a benchmark's methodology section before seeing final numbers reduces bias, using this week's own material." },
        { type: "Short answer", prompt: "Explain, from your own Day 26 experience, one concrete way real open-source contribution differs from a tutorial exercise.", requiresOwnEvidence: true },
        { type: "Quantitative", prompt: "Report your own final, multi-run benchmark statistics (mean and range) for at least two metrics, with a one-line interpretation of what they mean for real-world use.", requiresOwnEvidence: true },
        { type: "Research", prompt: "State the central claim of the paper you engaged with on Day 25, your reproduction outcome, and your own specific point of agreement or disagreement.", requiresOwnEvidence: true },
        { type: "System design", prompt: "Present your complete system architecture (as it exists today, after all 27 prior days) in a single diagram, noting which components you're most confident in and which you'd flag as weakest if directly asked in an interview.", requiresOwnEvidence: true },
        { type: "Open-ended", prompt: "You have 1-3 weeks (see the Capstone) to extend this project into something submission-worthy. Using your ablation results, security findings, and paper-reproduction reservations, propose the single highest-value extension, and justify why it beats three other extensions you're explicitly not pursuing.", requiresOwnEvidence: true },
      ],
    },
  },
  {
    week: 5, title: "Integration Buffer + Publish",
    exam: null,
    days: [
      { day: 29, week: 5, objective: "No new material — fix whatever Day 28's honest self-scan (or an actual second person's questioning) revealed as weak.", study: "This day exists because real engineering always surfaces something in the final review that needs another pass — budgeting for it explicitly is more honest than pretending the schedule goes perfectly.", materials: ["Your own Day 28 exam and its weak-area notes"], deepWork: "Prioritize the single weakest point revealed and fix it properly rather than patching everything shallowly.", build: "Whatever the honest self-scan revealed as needing another pass.", read: "N/A.", think: "What would you tell a friend starting this exact bootcamp about what you'd budget more time for?", miniTest: ["Why does this buffer day exist explicitly rather than being left implicit?", "What's the risk of skipping this day because \u2018everything already works\u2019?"], answers: ["Because real engineering always surfaces something in final review needing another pass — an explicit buffer is more honest than assuming a perfect schedule.", "Untested assumptions about \u2018done\u2019 are exactly what an interviewer's first follow-up question tends to expose."], output: "Whatever weak point you fixed today, committed with a clear message explaining what changed and why.", checkpoint: "Explain what you fixed today and why the original version wasn't good enough." },
      { day: 30, week: 5, objective: "Publish — share the repo and technical report with at least one real technical person and ask for genuinely critical feedback.", study: "Closing reflection as evidence of research maturity.", materials: ["Your finished repo and technical report"], deepWork: "Identify one professor, senior student, or GDG contact who will give you honest, critical feedback — not encouragement.", build: "Share the repo; collect real feedback.", read: "N/A.", think: "What's the most likely first question a critical reader will ask, and do you have a real answer?", miniTest: ["Why is critical feedback more valuable at this stage than encouragement?", "What should you do with feedback that contradicts a decision you were confident about?"], answers: ["Encouragement doesn't surface the gaps an interviewer or reviewer will actually find; critical feedback does, while you still have time to address it.", "Take it seriously and investigate rather than dismissing it — but you don't have to agree; document your reasoning either way."], output: "A short \u2018what I'd do differently\u2019 addendum to your technical report, based on real feedback received.", checkpoint: "State the most useful piece of critical feedback you received, and what you changed (or deliberately didn't) in response." },
    ],
  },
];

const EXAMS = [];

const PROJECTS_L123 = {
  1: [
    { title: "CLI tool validating/pretty-printing tool-call JSON against a schema" },
    { title: "FP32/FP16/INT8/INT4 memory-footprint calculator/visualizer" },
    { title: "Minimal single-tool agent (e.g. weather lookup), no memory, no multi-step planning" },
    { title: "Quantization inference benchmark — time a model at two quant levels" },
    { title: "Basic Android app loading and running one on-device model with a single hardcoded prompt" },
  ],
  2: [
    { title: "Two-agent draft/critique pipeline on a real, non-trivial task (e.g. code review)" },
    { title: "Agent evaluation harness with 10+ test cases including adversarial ones" },
    { title: "Permission-enforced tool sandbox as a reusable library" },
    { title: "Indirect prompt-injection defense demo — vulnerable vs. hardened, side by side" },
    { title: "Android app with real on-device/cloud fallback logic" },
  ],
  3: [
    { title: "3+ agent hierarchical delegation system, rigorously evaluated" },
    { title: "Automated quantization benchmark pipeline across 3+ quant levels" },
    { title: "Production-style observability stack (structured logs, correlation IDs, a simple dashboard)" },
    { title: "Agent-specific security test suite with a written threat model" },
    { title: "Partial or full reproduction of a real published agent-evaluation or on-device-inference paper" },
  ],
};

const FLAGSHIPS = [
  {
    id: 1, title: "Hybrid On-Device/Cloud Agentic Assistant with Security & Evaluation Harness", hedge: false, researchOriented: false,
    problem: "This is the actual month's deliverable, built across Weeks 1-4. Enterprise agent adoption is outpacing safe, efficient deployment — most agent systems are either fully cloud-dependent or naively on-device. This shows a principled hybrid, in a small reproducible system.",
    fields: [
      ["Why it matters", "Directly mirrors the real industry gap identified in the research phase, not a generic assignment."],
      ["Technical architecture", "Framework-free agent core (Week 1-2) + routing layer (Day 15-16) + Android integration with fallback (Day 6, 13, 17) + observability (Day 18) + security hardening (Day 9, 11, 19)."],
      ["Technologies", "Python, an LLM API of your choice, llama.cpp/GGUF or MLC-LLM, Android/Kotlin, a vector store for memory (Chroma or FAISS)."],
      ["Mathematical concepts", "Quantization arithmetic, embedding/similarity search, basic statistics for benchmarking."],
      ["Algorithms", "ReAct loop, retrieval (approximate nearest-neighbor for memory), routing decision logic."],
      ["Datasets", "Your own 10+ hand-designed evaluation test cases (Day 10) plus any public agent-benchmark subset (AgentBench/GAIA) you choose to additionally test against."],
      ["Hardware", "Your own Android device; free-tier Colab/Kaggle for any training-adjacent work (none strictly required, since you're using pretrained models)."],
      ["Evaluation methodology", "Multi-run benchmarking (Day 22), ablation studies (Day 23), security test suite (Day 19)."],
      ["Baseline", "A naive fully-cloud version and a naive fully-on-device version, both built as comparison points during Week 3."],
      ["Benchmark", "Your own Day 22 report — accuracy, latency (including P95), cost estimate, safety-violation rate."],
      ["Failure analysis", "Your Day 23 ablation table plus your Day 19 known-limitations section."],
      ["Visualization", "Architecture diagram (Day 15), benchmark comparison charts (Day 22)."],
      ["Documentation", "Full technical report (Day 24)."],
      ["Research component", "Day 25's paper engagement, connected explicitly to your own design choices."],
      ["Potential publication angle", "An MLSys or NeurIPS-workshop-style short paper on hybrid on-device/cloud agent routing with a security-first evaluation methodology — genuinely underexplored as of 2026."],
      ["Scalability", "Discuss explicitly what would need to change to serve real concurrent users rather than a single-device demo."],
      ["Real-world application", "Directly maps onto features your own target companies (Groww, CRED, Razorpay, Sarvam AI) are actively building in 2026."],
      ["What recruiters would find impressive", "Real measured trade-off data, a genuine security threat model, and a technical report that reads like an engineering postmortem, not a tutorial writeup."],
    ],
  },
  {
    id: 2, title: "Agentic AI Security Red-Team Tool", hedge: false, researchOriented: true,
    problem: "The source identifies this as the highest-leverage post-30-day capstone direction: turn the security testing work into a reusable tool. Given an agent interface/tool schema/task, automatically test its attack surface and produce a vulnerability report.",
    fields: [
      ["Scope", "Prompt-injection tests, indirect prompt-injection tests, tool-hijacking tests, excessive-agency tests, permission tests, sandbox tests, routing/security tests."],
      ["Includes", "Threat model, attack taxonomy, test cases, severity, reproducibility, mitigation, before/after results."],
      ["Design goal", "Framework-independent where practical — this should be treated as a potential open-source project, not just a demo."],
      ["Why highest-leverage", "It directly extends your strongest and most differentiated Tier-S specialization (Agentic AI Security & Evaluation) rather than diluting effort across a new domain."],
      ["Why realistic in 1-3 weeks", "It's an extension of code you already deeply understand (Days 9, 11, 19, 23), not a from-scratch new system."],
      ["What it should become", "A flagship GitHub project in its own right; internship-portfolio centerpiece; a legitimate candidate for a short paper or workshop submission if evaluation rigor is pushed far enough; and, if genuinely useful, a real open-source tool other students/engineers could adopt."],
    ],
  },
  {
    id: 3, title: "Cross-Device Edge AI Benchmark Suite", hedge: false, researchOriented: true,
    problem: "A public benchmark system comparing model size, quantization level, latency, memory, battery/energy where measurable, output quality, device/chipset, and on-device-vs-cloud performance.",
    fields: [
      ["Scope", "Support multiple Android devices if available; if not, design the benchmark so additional devices can be added later without a redesign."],
      ["Standards", "Reproducible results, published methodology, generated charts, machine-readable benchmark results (not just a screenshot)."],
      ["Design goal", "A potentially useful open-source project rather than a personal toy — extends Flagship #1's quantization pipeline (Day 12) into a public, comparative tool."],
      ["Why this fits your moat", "Very few engineers combine production Android engineering with quantization/inference-engineering depth — a public benchmark in this space is a rare, visible signal."],
    ],
  },
  {
    id: 4, title: "Physical-AI Simulation Project", hedge: true, researchOriented: false,
    problem: "A simulated robotic manipulation system, using simulation rather than requiring expensive physical hardware — the Part 17 hedge from the research document, built as a real project rather than left abstract.",
    fields: [
      ["Potential components", "Simulated robotic arm, physics environment, perception, planning, reinforcement learning, evaluation, simulation assets."],
      ["Your existing edge", "Uses your existing Blender modeling skills (heart/vascular model, hospital prototype) to build the simulation environment's assets — a direct, low-cost entry point most CS students lack."],
      ["Role in the overall plan", "Secondary/hedge specialization — this does NOT replace the main Agentic AI + Edge AI path. It's explicitly labeled as a hedge, not a pivot."],
      ["Why it's a legitimate hedge, not wasted effort", "It shares real infrastructure with the primary path (world models, simulation, evaluation harnesses) — the RL/evaluation foundations transfer almost entirely if you ever lean into this further."],
    ],
  },
  {
    id: 5, title: "Research Reproduction + Extension", hedge: false, researchOriented: true,
    problem: "Choose a real published paper relevant to agent evaluation, agent security, on-device inference, quantization, or ML systems. Reproduce a meaningful result, then propose one defensible extension.",
    fields: [
      ["Must document", "Original claim, methodology, implementation, data, result, discrepancy (if any), hypothesis for the discrepancy, limitations, and your own personal technical assessment."],
      ["Critical honesty rule", "Do NOT fake successful reproduction. A failed reproduction with rigorous analysis is acceptable and should be documented honestly — this is explicitly not a pass/fail on matching the paper's numbers."],
      ["Extends from", "Day 25's paper engagement — this flagship is that work taken to full rigor and written up as a standalone artifact rather than a bootcamp day's output."],
    ],
  },
];

const OPEN_SOURCE_STEPS = [
  "Find an appropriate project (an MCP server implementation, llama.cpp, MLC-LLM, or an agent-evaluation tool)",
  "Read the project's architecture, not just the one file you plan to touch",
  "Read CONTRIBUTING.md in full before writing any code",
  "Find an appropriate issue (a real \u2018good first issue\u2019, not a made-up task)",
  "Understand the surrounding code well enough to explain why it's structured the way it is",
  "Implement a focused, minimal change",
  "Add tests where the project's conventions call for them",
  "Submit the PR following the project's actual contribution standards",
  "Respond to review comments (expect at least one round — this is normal, not failure)",
  "Record the final result honestly: merged, changes requested, or closed unmerged",
];

const OUTREACHY_STAGES = [
  { id: "stage1", title: "Stage 1 — Eligibility", note: "Outreachy is a real, established program: paid, remote, roughly 3-month internships, open worldwide to people facing systemic bias or underrepresentation in tech, run in two cohorts a year (historically May-Aug and Dec-Mar/Jun-Aug). Exact 2027 dates and the current eligibility wording are not published yet — verify both directly at outreachy.org/apply/eligibility before relying on anything here.", items: [
    "Read Outreachy's current eligibility page in full and confirm you meet the criteria as written then (not as guessed here)",
    "Confirm you can commit full-time to the roughly 3-month internship period if selected",
    "Confirm you have no major conflicting commitment (exams, other internships) across the likely May-August 2027 window",
    "Note the actual 2027 timeline once announced (initial application \u2192 contribution period \u2192 final application \u2192 results \u2192 internship)",
  ]},
  { id: "stage2", title: "Stage 2 — Preparation", note: "General open-source readiness — useful regardless of which project you eventually target.", items: [
    "Comfortable with Git: branching, rebasing, resolving conflicts, writing a clear commit message",
    "Comfortable navigating GitHub: issues, PRs, forks, review threads",
    "Comfortable with basic Linux command-line usage",
    "Comfortable reading an unfamiliar codebase before changing it",
    "Practiced writing tests for a change, not just the change itself",
    "Practiced writing clear documentation for a change",
    "Understand open-source etiquette: how to ask a mentor a good question, how to handle silence or rejection gracefully",
  ]},
  { id: "stage3", title: "Stage 3 — Project Discovery", note: "This stage only becomes real once a cohort's project list is public — use the Project Matching table below to compare real candidates when that happens.", items: [
    "Review the live Outreachy project list once the cohort opens (do not rely on last cycle's list)",
    "Shortlist 1-2 projects that genuinely match your Agentic AI / Edge AI / Security specialization",
    "Check each shortlisted project's required and preferred skills against your own",
    "Check each project's contribution tasks and how active/responsive its mentors have been",
  ]},
  { id: "stage4", title: "Stage 4 — Contribution Period", note: "The actual differentiator — Outreachy explicitly favors applicants who make multiple small, consistent contributions over the contribution period, not one large last-minute one.", items: [
    "Introduce yourself to the mentor(s) appropriately, following the project's own contribution guide",
    "Complete the project's required starter contribution task(s)",
    "Make small, meaningful contributions consistently through the period rather than one large one at the end",
    "Ask specific, well-researched technical questions rather than ones answered in the docs",
    "Respond promptly and gracefully to review feedback",
    "Keep a running contribution log (below) as you go, not reconstructed afterward",
  ]},
  { id: "stage5", title: "Stage 5 — Final Application", note: "Track logistics here; write the actual essays yourself in the space below — this app will not draft them for you.", items: [
    "Confirm the final application deadline once announced and back-plan at least 3 days of buffer",
    "List the specific contributions you'll reference in your final application",
    "List the mentor interactions/feedback you'll reference",
    "Submit the final application before the deadline (Outreachy does not accept late applications)",
  ]},
];

const RESEARCH_LIBRARY = [
  { category: "AI Infrastructure", tag: "FACT", text: "The largest hyperscalers are guiding to combined 2026 capex of roughly $630-800 billion, up ~60-77% from 2025, with ~70-75% of that AI-specific.", source: "Futurum Group, Goldman Sachs, IEEE ComSoc, valueaddvc.com; Dec 2025-Aug 2026" },
  { category: "AI Infrastructure", tag: "FACT", text: "Microsoft disclosed an $80B Azure order backlog it cannot fulfill due to power limits — hyperscalers describe themselves as supply-constrained, not demand-constrained.", source: "Futurum Group, Feb 2026" },
  { category: "AI Infrastructure", tag: "INFERENCE", text: "The bottleneck for the next 2-3 years is systems engineering (inference efficiency, power, deployment) rather than model quality — favoring a systems-minded engineer over a pure research scientist.", source: "Derived from capex data" },
  { category: "Physical AI", tag: "FACT", text: "Robotics startups raised roughly $23-55 billion in 2026 depending on scope; humanoid robotics specifically raised $8.6B+ YTD, 2.8x the pace of 2025.", source: "Dealroom, Tracxn, CNBC, valueaddvc.com; June-July 2026" },
  { category: "Physical AI", tag: "FACT", text: "NVIDIA declared 2026 the year of \u201cPhysical AI,\u201d releasing Cosmos world-foundation models, Isaac simulation frameworks, and GR00T robot-brain models.", source: "NVIDIA Newsroom, Jan-Aug 2026" },
  { category: "Physical AI", tag: "SPECULATION", text: "Goldman Sachs projects the humanoid robotics market at roughly $38B by 2035.", source: "AI Funding Tracker citing Goldman Sachs, May 2026" },
  { category: "Defense Tech", tag: "FACT", text: "Defense-tech venture funding hit a record $14.6-17.4 billion in 2026, up from $9.6-11.2B in 2025; Anduril reached a $61B valuation on a $5B Series H.", source: "Crunchbase News, Washington Times, valueaddvc.com; June-July 2026" },
  { category: "Semiconductors (India)", tag: "FACT", text: "India launched Semicon 2.0 in July 2026 with an outlay of ~\u20b91.27-1.28 lakh crore (~$13.2B), up from ~\u20b976,000 crore (~$8B) under Semicon 1.0.", source: "India Semiconductor Mission (ism.gov.in), IBEF, PIB; July 2026" },
  { category: "Semiconductors (India)", tag: "FACT", text: "24 chip-design startups, 67,000 students, and 1,000+ startup engineers are actively using India's national EDA tool platform; 122 student chip designs have taped out.", source: "PIB press release, Feb 2026" },
  { category: "Semiconductors (India)", tag: "SPECULATION", text: "India's domestic semiconductor market (~$38B in 2023) is projected to cross $100B by 2030.", source: "Invest India, 2026" },
  { category: "IndiaAI Mission", tag: "FACT", text: "IndiaAI Mission approved with an outlay of ~\u20b910,372 crore (~$1.2B), expanding subsidized GPU compute from 10,000 to 38,000 GPUs.", source: "News on Air / PIB, Nov 2025" },
  { category: "Quantum Computing", tag: "FACT", text: "The U.S. government committed $2 billion in grants/equity stakes across nine quantum companies via the CHIPS Act; private VC in quantum hit $4.9 billion in 2025.", source: "WSJ via Forbes, Investing.com, The Quantum Insider; May-June 2026" },
  { category: "Quantum Computing", tag: "INFERENCE", text: "Quantum investment is running well ahead of quantum commercial revenue — real and strategically important, but the non-PhD hiring window is still mostly 2030+.", source: "Derived from QED-C State of Quantum Industry report" },
  { category: "AI + Biology", tag: "FACT", text: "Anthropic acquired computational-biology startup Coefficient Bio for $400M in stock (April 2026); AI-related M&A in pharma/biotech grew from 34 deals ($3.2B) in 2024 to 99 deals ($12.3B) in 2025.", source: "Bessemer Venture Partners, DealForma via IntuitionLabs; 2026" },
  { category: "Energy for AI", tag: "FACT", text: "Hyperscalers have collectively committed $50B+ to nuclear/SMR power specifically to feed AI data centers; global data-center electricity use is forecast to exceed 1,000 TWh by end of 2026.", source: "IDTechEx, Axis Intelligence, Gartner/IEA via indmoney.com; 2026" },
  { category: "Agentic AI", tag: "FACT", text: "65-81% of enterprises report already using or scaling AI agents, but only ~11% have genuinely production-scale, multi-agent systems running.", source: "Forrester \u201cState of Agentic AI 2026\u201d, CrewAI survey, digitalapplied.com; Feb-June 2026" },
  { category: "Agentic AI", tag: "FACT", text: "88% of organizations deploying agents in production report security incidents; only 23% have agent-specific security frameworks. Average agent-related breach cost ~$4.7M.", source: "digitalapplied.com \u201cAgentic AI Statistics 2026\u201d, shattered.io; June 2026" },
  { category: "Agentic AI", tag: "FACT", text: "The agentic-AI-security market specifically is projected to grow from $1.65B (2026) to $13.5B (2032) — a 42% CAGR.", source: "MarketsAndMarkets, softwarestrategiesblog.com; Aug 2026" },
  { category: "Agentic AI", tag: "SPECULATION", text: "Gartner expects over 40% of agentic AI projects to be cancelled by 2027 due to unclear ROI or poor engineering.", source: "paul-okhrem.com citing Gartner" },
  { category: "Edge AI", tag: "FACT", text: "The edge-AI hardware market is projected to go from ~$30.7B (2026) to $68.7B (2031), and over $80B by 2036.", source: "AI2Work, NeuralCoreTech; 2026" },
  { category: "Edge AI", tag: "FACT", text: "2026 is the year on-device NPUs crossed a real usability threshold: 7-8B-parameter quantized LLMs now run on phones/laptops at usable speed under 10 watts.", source: "GeniusTechLab, June 2026" },
  { category: "Edge AI", tag: "INFERENCE", text: "Very few engineers combine production mobile shipping experience with quantization/inference-engineering depth — a genuine supply gap, not a demand gap.", source: "Derived from edge-AI hardware and hiring data" },
  { category: "India Deep Tech", tag: "FACT", text: "Indian deep-tech startups raised $2.96B across 189 deals in 2025 (record year), and ~$1B across 103 deals by July 2026; 3,000+ DPIIT-recognized deep-tech startups exist, up from under 500 in 2018.", source: "Goa Chronicle (Aug 2026), IncorpX (Apr 2026)" },
];

const IOT_CHAIN = [
  { title: "IoT", desc: "Sensor-equipped physical devices generating continuous real-world data.", skillLink: null },
  { title: "Sensors / Data", desc: "Raw signal acquisition — the input every downstream step depends on.", skillLink: null },
  { title: "Edge Computing", desc: "Processing that data near its source instead of shipping it to the cloud first.", skillLink: null },
  { title: "Local Inference", desc: "Running a model's forward pass on the edge device itself.", skillLink: "On-Device AI" },
  { title: "Efficient Models", desc: "Quantized/distilled models small enough to actually fit an edge device's constraints.", skillLink: "Quantization" },
  { title: "Device Constraints", desc: "Power budget, memory, thermal limits — the same constraints Android deployment already forces you to reason about.", skillLink: "Android Deployment" },
  { title: "On-Device AI", desc: "Where the IoT chain and the Edge AI career field converge directly.", skillLink: "On-Device AI" },
  { title: "AI-Enabled IoT", desc: "The resulting category: physical devices making local, private, low-latency decisions using AI.", skillLink: null },
];

const ACADEMIC_SEED = [
  { name: "DSA (C++)", units: "26-topic prerequisite-sequenced curriculum; STL essentials and array patterns covered; binary search started", weakTopics: "", notes: "Structured DSA study track in C++.", progress: 15 },
  { name: "Core CS coursework", units: "", weakTopics: "", notes: "Add units/topics as the semester progresses.", progress: 0 },
  { name: "GDG on Campus IGDTUW — UI/UX & C++ tracks", units: "", weakTopics: "", notes: "Active member; useful network for open-source and flagship-project collaborators.", progress: 0 },
];

const RESUME_SIGNAL_TABLE = [
  { skill: "Framework-free agent architecture", project: "Flagship #1 core loop", result: "Working multi-step agent, no orchestration library", evidence: "GitHub + README", signal: "Systems-level agent architecture" },
  { skill: "Permissions/sandboxing", project: "Day 9, 11, 19 hardening", result: "Least-privilege tool execution enforced", evidence: "GitHub + threat model doc", signal: "AI security engineering" },
  { skill: "Evaluation + ablations", project: "Day 10, 22, 23", result: "Automated multi-metric harness + ablation table", evidence: "Benchmark report", signal: "Rigorous, evidence-based engineering" },
  { skill: "Quantization pipeline", project: "Day 12 / Flagship #3", result: "FP16 vs INT4 accuracy/speed trade-off, your own numbers", evidence: "GitHub + benchmark report", signal: "ML systems / on-device optimization" },
  { skill: "Android + cloud fallback integration", project: "Flagship #1 Android path", result: "On-device inference with automatic fallback, P95 profiled", evidence: "Demo + GitHub", signal: "Rare mobile + ML systems combination" },
  { skill: "Paper reproduction", project: "Day 25 / Flagship #5", result: "Documented match or honest discrepancy", evidence: "Reproduction report", signal: "Research literacy" },
  { skill: "Open-source contribution", project: "Day 26 open-source track", result: "Submitted PR, review outcome recorded", evidence: "PR link", signal: "Works in unfamiliar, production codebases" },
  { skill: "Agentic AI security testing", project: "Flagship #2", result: "Vulnerability report with severity + mitigations", evidence: "GitHub + report", signal: "AI security evidence" },
  { skill: "Technical writing", project: "Day 24 technical report", result: "Full methodology/results/limitations writeup", evidence: "Technical report", signal: "Professional-standard technical communication" },
];


const MOAT_COMBOS = [
  "Agentic AI orchestration + on-device/edge deployment — almost nobody pursuing \u2018AI engineer\u2019 roles also ships production Android apps.",
  "Agent evaluation/security + software testing rigor — most agent builders can't test rigorously; most testers don't understand agent failure modes.",
  "Android/mobile systems engineering + quantization/inference optimization — mobile-performance-engineering skills (battery, memory, latency) map almost perfectly onto on-device AI constraints.",
  "Fairness-aware ML (your existing heart-disease project) + agent evaluation — bias auditing and agent-failure-mode auditing are methodologically similar.",
  "Blender/3D modeling + robotics simulation — a direct, low-cost entry point into physical-AI simulation environments most CS students lack.",
  "Distributed systems + AI infrastructure + GPU-aware programming — the classic ML systems engineer combo; harder to enter as an undergrad but extremely durable.",
  "Computational biology + fairness-aware ML — a real Tier-A path if you develop a biology elective alongside your existing clinical-ML project.",
  "Semiconductor design literacy (via India's free EDA tools) + ML compiler awareness — almost no CS-only students touch chip design at all.",
  "Control theory + reinforcement learning + simulation engineering — the core physical-AI stack; your IOQM math background gives you a running start.",
  "Technical writing/documentation rigor + open-source contribution — unglamorous, universally undervalued by students, directly visible to any recruiter who reads your GitHub.",
];



const NAV = [
  { id: "home", label: "Home", icon: Home },
  { id: "career", label: "Career Map", icon: Compass },
  { id: "skills", label: "Skill Tree", icon: GitBranch },
  { id: "bootcamp", label: "30-Day Bootcamp", icon: CalendarDays },
  { id: "projects", label: "Project Lab", icon: FlaskConical },
  { id: "portfolio", label: "Portfolio", icon: Briefcase },
  { id: "opensource", label: "Open Source", icon: GitPullRequest },
  { id: "outreachy", label: "Outreachy 2027", icon: Rocket },
  { id: "academics", label: "Academics", icon: GraduationCap },
  { id: "iot", label: "IoT Track", icon: Cpu },
  { id: "library", label: "Research Library", icon: Library },
  { id: "progress", label: "Career Moat", icon: Gauge },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

function SidebarInner({ tab, goTo, mode, onClose }) {
  return (
    <>
      <div className="px-5 py-5 border-b border-[#CBD5E1] flex items-center justify-between">
        <div>
          <div className="cos-brand-kicker font-mono text-[11px] tracking-[0.18em]">CAREER OS</div>
          <div className="text-[#0F172A] text-sm font-semibold mt-1">2036 Moat Project</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A]" aria-label="Close menu">
            <X size={18} />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => goTo(n.id)}
            className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors border-l-2 ${
              tab === n.id
                ? "border-[#E8A33D] bg-[#FFFFFF] text-[#0F172A]"
                : "border-transparent text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFFFFF]/60"
            }`}
          >
            <n.icon size={15} />
            {n.label}
          </button>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-[#CBD5E1] text-[10px] font-mono text-[#64748B] tracking-wider">
        MODE: {mode.toUpperCase()}
      </div>
    </>
  );
}



export default function App() {
  const { state, update, loaded, resetAll, saveStatus } = useCareerOsStorage();
  const [tab, setTab] = useState("home");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focusDay, setFocusDay] = useState(null);
  const [focusField, setFocusField] = useState(null);
  const [focusSkill, setFocusSkill] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const searchIndex = useMemo(() => buildSearchIndex(), []);
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return searchIndex.filter((i) => i.text.toLowerCase().includes(q)).slice(0, 30);
  }, [query, searchIndex]);

  const goTo = (t, extra) => {
    setTab(t);
    setSearchOpen(false);
    setQuery("");
    setMobileNavOpen(false);
    if (extra?.day) setFocusDay(extra.day);
    if (extra?.field) setFocusField(extra.field);
    if (extra?.skill) setFocusSkill(extra.skill);
  };

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((s) => !s);
      }
      if (e.key === "Escape") { setSearchOpen(false); setMobileNavOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!loaded) {
    return (
      <div className="h-full min-h-[600px] flex cos-app-shell" role="status" aria-live="polite" aria-label="Loading career OS">
        <style>{`
          @keyframes cos-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.9; } }
          .cos-skel { animation: cos-pulse 1.4s ease-in-out infinite; background: #1F2530; border-radius: 6px; }
        `}</style>
        <div className="w-60 flex-shrink-0 border-r border-[#E2E8F0] p-4 space-y-3 hidden md:block">
          <div className="cos-skel h-4 w-24" />
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="cos-skel h-6 w-full" style={{ animationDelay: `${i * 60}ms` }} />)}
        </div>
        <div className="flex-1 p-8 space-y-4">
          <div className="cos-skel h-6 w-72" />
          <div className="cos-skel h-4 w-96" />
          <div className="grid grid-cols-3 gap-4 pt-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="cos-skel h-20" style={{ animationDelay: `${i * 100}ms` }} />)}
          </div>
        </div>
        <span className="sr-only">Loading your saved progress…</span>
      </div>
    );
  }

  return (
    <div className="cos-app-shell flex h-full min-h-[700px] text-[#334155]" style={{ fontFamily: "var(--font-body)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        :root { --font-display: Inter, system-ui, sans-serif; --font-body: Inter, system-ui, sans-serif; --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace; --cos-bg:#F8FAFC; --cos-surface:#FFFFFF; --cos-surface-2:#F1F5F9; --cos-border:#E2E8F0; --cos-text:#0F172A; --cos-muted:#475569; --cos-dim:#64748B; --cos-amber:#F59E0B; --cos-cyan:#06B6D4; --cos-red:#DC2626; }
        .font-mono { font-family:var(--font-mono); }
        .cos-app-shell { background:var(--cos-bg); color:var(--cos-text); }
        .cos-panel { background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.05); transition:border-color .15s ease,box-shadow .15s ease; }
        .cos-panel:hover { border-color:#CBD5E1; }
        .cos-section-header { border-bottom:1px solid #E2E8F0; }
        .cos-eyebrow { color:#64748B; letter-spacing:.14em; text-transform:uppercase; }
        .cos-brand-kicker { color:#B45309; }
        .cos-nav-item svg { width:17px; height:17px; flex:none; stroke-width:2; }
        .cos-nav-active { box-shadow:none; }
        .cos-progress-track { background:#F1F5F9; border:1px solid #E2E8F0; }
        .cos-progress-fill { background:#6366F1!important; border-radius:999px; }
        .cos-status-pill { border:1px solid #E2E8F0; }
        .cos-input-wrap, .cos-textarea { background:#FFFFFF; border:1px solid #E2E8F0; transition:border-color .15s ease; }
        .cos-input-wrap:focus-within, .cos-textarea:focus { border-color:#94A3B8; box-shadow:0 0 0 3px rgba(99,102,241,.08); }
        .cos-collapsible { background:#FFFFFF; border-color:#E2E8F0; }
        .cos-collapsible > button:hover { background:#F8FAFC; }
        .cos-search-trigger { background:#FFFFFF; border:1px solid #E2E8F0; box-shadow:0 1px 2px rgba(0,0,0,.03); }
        .cos-search-trigger:hover { border-color:#94A3B8; background:#FFFFFF; }
        .cos-kbd { color:#475569; background:#F1F5F9; border:1px solid #E2E8F0; border-radius:5px; padding:2px 6px; }
        .cos-trust { color:#64748B; }
        .cos-hero { position:relative; overflow:hidden; background:#FFFFFF; border-color:#E2E8F0; box-shadow:0 1px 3px rgba(0,0,0,.05); }
        .cos-hero:before { display:none; }
        .cos-stat { min-height:132px; }
        .cos-stat-label { color:#64748B; }
        .cos-stat-value { color:#0F172A; font-variant-numeric:tabular-nums; }
        .cos-stat-extreme { color:#B91C1C; background:#FEF2F2; border:1px solid #FECACA; border-radius:5px; }
        .cos-stat-extreme::before { content:"["; }
        .cos-stat-extreme::after { content:"]"; }
        .cos-quick { text-align:left; position:relative; overflow:hidden; background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:20px; transition:border-color .15s ease; box-shadow:0 1px 3px rgba(0,0,0,.05); }
        .cos-quick:hover { border-color:#94A3B8; }
        .cos-icon-tile { width:40px; height:40px; display:grid; place-items:center; border-radius:8px; background:#F1F5F9; border:1px solid #E2E8F0; margin-bottom:14px; }
        .cos-cta { background:#F59E0B; color:#0F172A; box-shadow:none; transition:background-color .15s ease,border-color .15s ease,color .15s ease; }
        .cos-cta:hover { background:#FBBF24; }
        .cos-overlay { background:rgba(15,23,42,.38); backdrop-filter:blur(5px); }
        ::-webkit-scrollbar { width:9px; height:9px; }
        ::-webkit-scrollbar-track { background:#F8FAFC; }
        ::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:999px; border:2px solid #F8FAFC; }
        ::-webkit-scrollbar-thumb:hover { background:#94A3B8; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:13px; height:13px; border-radius:50%; background:#6366F1; cursor:pointer; box-shadow:none; }
        button:focus-visible, input:focus-visible, textarea:focus-visible, a:focus-visible { outline:2px solid #6366F1; outline-offset:2px; border-radius:6px; }
        button { transition:background-color 150ms ease,border-color 150ms ease,color 150ms ease; }
        button:active { transform:none; }
        @media (prefers-reduced-motion: reduce) { *,*::before,*::after { scroll-behavior:auto!important; transition:none!important; animation:none!important; } }
        .cos-collapse { display:grid; grid-template-rows:0fr; transition:grid-template-rows 200ms ease; }
        .cos-collapse.cos-open { grid-template-rows:1fr; }
        .cos-collapse > div { overflow:hidden; }
        @media (max-width:767px) { .cos-page-title { font-size:1.8rem; } .cos-stat { min-height:118px; } }
      `}</style>

      {}
      <aside className="hidden md:flex w-[272px] flex-shrink-0 border-r border-[#E2E8F0] flex-col bg-white">
        <SidebarInner tab={tab} goTo={goTo} mode={state.settings.mode} />
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] flex flex-col bg-white border-r border-[#E2E8F0]">
            <SidebarInner tab={tab} goTo={goTo} mode={state.settings.mode} onClose={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      )}

      {}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-4 md:px-7 py-3.5 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-xl sticky top-0 z-30">
          <button onClick={() => setMobileNavOpen(true)} className="md:hidden text-[#64748B] hover:text-[#0F172A] flex-shrink-0" aria-label="Open menu">
            <Menu size={20} />
          </button>
          <button onClick={() => setSearchOpen(true)} className="cos-search-trigger flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[#64748B] text-sm w-full max-w-[260px] sm:max-w-sm md:w-96 transition-colors">
            <Search size={14} className="flex-shrink-0" />
            <span className="truncate">Search everything…</span>
            <span className="ml-auto font-mono text-[10px] cos-kbd hidden sm:inline">⌘K</span>
          </button>
          <div className="ml-auto hidden lg:flex items-center gap-2 text-xs font-mono cos-trust" role="status" aria-live="polite">
            {saveStatus === "pending" && (<><span className="w-1.5 h-1.5 rounded-full bg-[#D3A15E] animate-pulse" /> Saving…</>)}
            {saveStatus === "saved" && (<><CheckCircle2 size={12} className="text-[#6FBFAE]" /> <span className="text-[#6FBFAE]">Saved</span></>)}
            {saveStatus === "idle" && <><Shield size={12} className="text-[#64748B]" /> <span>Stored locally · private by default</span></>}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 py-6 md:py-9">
        <div key={tab} className="cos-fade-in max-w-[1320px] mx-auto">
          {tab === "home" && <HomeView state={state} update={update} goTo={goTo} />}
          {tab === "career" && <CareerMapView focusField={focusField} />}
          {tab === "skills" && <SkillTreeView state={state} update={update} goTo={goTo} focusSkill={focusSkill} />}
          {tab === "bootcamp" && <BootcampView state={state} update={update} focusDay={focusDay} />}
          {tab === "projects" && <ProjectLabView state={state} update={update} goTo={goTo} />}
          {tab === "portfolio" && <PortfolioView state={state} update={update} />}
          {tab === "opensource" && <OpenSourceView state={state} update={update} />}
          {tab === "outreachy" && <OutreachyView state={state} update={update} />}
          {tab === "academics" && <AcademicsView state={state} update={update} />}
          {tab === "iot" && <IotView state={state} update={update} />}
          {tab === "library" && <LibraryView />}
          {tab === "progress" && <ProgressView state={state} />}
          {tab === "settings" && <SettingsView state={state} update={update} resetAll={resetAll} />}
        </div>
        </div>
      </main>

      {}
      {searchOpen && (
        <div className="fixed inset-0 cos-overlay flex items-start justify-center pt-20 sm:pt-24 px-4 z-50" onClick={() => setSearchOpen(false)}>
          <div className="cos-panel w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E2E8F0]">
              <Search size={15} className="text-[#64748B]" />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fields, skills, bootcamp days, projects…"
                className="bg-transparent outline-none text-sm text-[#0F172A] w-full" />
              <button onClick={() => setSearchOpen(false)}><X size={15} className="text-[#64748B]" /></button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {results.length === 0 && query && <div className="p-4 text-sm text-[#64748B]">No matches.</div>}
              {results.map((r, i) => (
                <button key={i} onClick={() => goTo(r.tab, r.extra)} className="w-full text-left px-4 py-2.5 hover:bg-white/[0.035] flex items-center gap-3 border-b border-[#F1F5F9]">
                  <span className="text-[10px] font-mono text-[#64748B] w-20 flex-shrink-0">{r.category}</span>
                  <span className="text-sm text-[#334155] truncate">{r.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildSearchIndex() {
  const idx = [];
  FIELDS.forEach((f) => idx.push({ category: "Field", text: f.name, tab: "career", extra: { field: f.id } }));
  SKILL_NODES.forEach((s) => idx.push({ category: "Skill", text: s.name, tab: "skills" }));
  BOOTCAMP_WEEKS.forEach((w) => w.days.forEach((d) => idx.push({ category: `Day ${d.day}`, text: d.objective, tab: "bootcamp", extra: { day: d.day } })));
  Object.values(PROJECTS_L123).flat().forEach((p) => idx.push({ category: "Project", text: p.title, tab: "projects" }));
  FLAGSHIPS.forEach((f) => idx.push({ category: "Flagship", text: f.title, tab: "projects" }));
  RESEARCH_LIBRARY.forEach((r) => idx.push({ category: r.category, text: r.text, tab: "library" }));
  return idx;
}



function HomeView({ state, update, goTo }) {
  const nextDay = useMemo(() => {
    for (const w of BOOTCAMP_WEEKS) {
      for (const d of w.days) {
        const done = state.bootcamp[d.day]?.outputDone;
        if (!done) return d;
      }
    }
    return null;
  }, [state.bootcamp]);

  const totalDays = BOOTCAMP_WEEKS.reduce((s, w) => s + w.days.length, 0);
  const doneDays = Object.values(state.bootcamp).filter((d) => d?.outputDone).length;

  return (
    <div className="max-w-4xl">
      <SectionHeader
        eyebrow="DAILY COMMAND CENTER"
        title="What should I do today?"
        sub="Pulled live from your bootcamp progress, academics, and open-source track — not a static checklist."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-7">
        <Panel className="cos-stat p-5 md:p-6">
          <div className="cos-stat-label text-xs font-medium mb-2">Bootcamp progress</div>
          <div className="cos-stat-value text-3xl font-semibold font-mono tracking-tight">{doneDays}<span className="text-sm font-normal text-[#64748B]">/{totalDays} days</span></div>
          <ProgressBar value={doneDays} max={totalDays} />
        </Panel>
        <Panel className="cos-stat p-5 md:p-6">
          <div className="cos-stat-label text-xs font-medium mb-3">Mode</div>
          <div className="inline-flex items-center gap-2.5 cos-stat-extreme rounded-full px-3.5 py-2 text-sm font-semibold font-mono uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#F87171]" />
            {state.settings.mode}
          </div>
          <div className="text-xs text-[#64748B] mt-3">Change in Settings</div>
        </Panel>
        <Panel className="cos-stat p-5 md:p-6">
          <div className="cos-stat-label text-xs font-medium mb-3">Open-source status</div>
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#64748B]" />
            <div className="cos-stat-value text-xl font-semibold capitalize">{(state.openSource.status || "not_started").replace("_", " ")}</div>
          </div>
        </Panel>
      </div>

      {nextDay ? (
        <Panel className="cos-hero p-6 md:p-7 mb-7">
          <div className="relative z-10">
          <div className="text-[11px] font-mono font-semibold tracking-[0.16em] text-[#A5B4FC] mb-3">NEXT UP — WEEK {nextDay.week} · DAY {nextDay.day}</div>
          <div className="text-xl md:text-2xl text-[#0F172A] font-semibold tracking-[-0.02em] mb-2 max-w-3xl">{nextDay.objective}</div>
          <button onClick={() => goTo("bootcamp", { day: nextDay.day })} className="cos-cta text-sm font-semibold px-4 py-2.5 rounded-md">
            Open Day {nextDay.day}
          </button>
          </div>
        </Panel>
      ) : totalDays > 0 ? (
        <Panel className="p-5 mb-6">
          <div className="text-[#6FBFAE] font-medium">All 30 days complete. Head to the Capstone in Project Lab.</div>
        </Panel>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <QuickLink goTo={goTo} tab="career" title="Career Map" desc="Revisit why this specialization, with full scoring." icon={Compass} />
        <QuickLink goTo={goTo} tab="skills" title="Skill Tree" desc="See the dependency chain and mark what you understand." icon={GitBranch} />
        <QuickLink goTo={goTo} tab="projects" title="Project Lab" desc="Track Flagship #1 build and the project ladder." icon={FlaskConical} />
        <QuickLink goTo={goTo} tab="opensource" title="Open Source" desc="Your Day 26 real contribution, guided step by step." icon={GitPullRequest} />
      </div>
    </div>
  );
}

function QuickLink({ goTo, tab, title, desc, icon: Icon }) {
  return (
    <button onClick={() => goTo(tab)} className="cos-quick">
      <span className="cos-icon-tile"><Icon size={18} className="text-[#A5B4FC]" /></span>
      <div className="text-base font-semibold text-[#0F172A]">{title}</div>
      <div className="text-sm text-[#475569] mt-1 leading-6">{desc}</div>
      <span className="absolute right-5 top-5 text-[#475569]">→</span>
    </button>
  );
}



function CareerMapView({ focusField }) {
  const [tierFilter, setTierFilter] = useState("All");
  const [clusterFilter, setClusterFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState("explore");
  const [compareIds, setCompareIds] = useState([]);

  useEffect(() => { if (focusField) { setSelected(focusField); setViewMode("explore"); } }, [focusField]);

  const tiers = ["All", "S", "A", "Watchlist", "Dead-end"];
  const clusters = ["All", ...Array.from(new Set(FIELDS.map((f) => f.cluster)))];
  const filtered = FIELDS.filter((f) =>
    (tierFilter === "All" || f.tier === tierFilter) &&
    (clusterFilter === "All" || f.cluster === clusterFilter)
  );
  const activeField = FIELDS.find((f) => f.id === selected);
  const scored = activeField ? SCORED.find((s) => s.id === activeField.id) : null;
  const detail = activeField ? TIER_S_DETAIL[activeField.id] : null;

  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="max-w-6xl">
      <SectionHeader eyebrow="PART III–IX OF THE RESEARCH" title="Career Field Explorer" sub="40 candidate fields, scored and tiered. Click any field for full reasoning." />

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {[['explore', 'Explore'], ['compare', 'Compare'], ['timeline', 'Timeline']].map(([k, label]) => (
          <button key={k} onClick={() => setViewMode(k)}
            className={`text-xs font-mono px-3.5 py-2 rounded-full border transition-colors ${viewMode === k ? "bg-[#0F172A] text-white border-[#0F172A]" : "bg-white border-[#E2E8F0] text-[#475569] hover:border-[#94A3B8] hover:text-[#0F172A]"}`}>
            {label}
          </button>
        ))}
      </div>

      {viewMode !== "timeline" && (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-3 mb-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] mr-1">Tier</span>
            {tiers.map((t) => (
              <button key={t} onClick={() => setTierFilter(t)}
                className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-colors ${tierFilter === t ? "bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]" : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8] hover:text-[#0F172A]"}`}>
                {t === "All" ? "All 40" : `Tier ${t}`}
              </button>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] mr-1">Domain</span>
            {clusters.map((cluster) => (
              <button key={cluster} onClick={() => setClusterFilter(cluster)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${clusterFilter === cluster ? "bg-[#ECFEFF] text-[#0E7490] border-[#A5F3FC]" : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8] hover:text-[#0F172A]"}`}>
                {cluster}
              </button>
            ))}
            {(tierFilter !== "All" || clusterFilter !== "All") && (
              <button onClick={() => { setTierFilter("All"); setClusterFilter("All"); }} className="ml-auto text-[11px] font-mono text-[#64748B] hover:text-[#0F172A] underline underline-offset-2">
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {viewMode === "explore" && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <div className="md:col-span-2 space-y-2 max-h-[72vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-xs text-[#64748B]">{filtered.length} field{filtered.length === 1 ? "" : "s"}</span>
              <span className="text-[10px] font-mono text-[#94A3B8]">SELECT TO INSPECT</span>
            </div>
            {filtered.map((f) => (
              <button key={f.id} onClick={() => setSelected(f.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${selected === f.id ? "border-[#6366F1] bg-[#EEF2FF] border-l-4" : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]"}`}>
                <div className="flex items-start justify-between gap-3">
                  <span className={`text-sm leading-5 ${selected === f.id ? "text-[#312E81] font-semibold" : "text-[#0F172A] font-medium"}`}>{f.name}</span>
                  <TierBadge tier={f.tier} />
                </div>
                <div className="text-xs text-[#64748B] mt-2 leading-5">{f.cluster}</div>
              </button>
            ))}
          </div>

          <div className="md:col-span-3">
            {!activeField && <EmptyState icon={Compass} title="Select a field" sub="Click any field on the left to see its full research-backed reasoning." />}
            {activeField && (
              <Panel className="p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] mb-1">Career field</div>
                    <h2 className="text-xl font-semibold tracking-tight text-[#0F172A]">{activeField.name}</h2>
                  </div>
                  <TierBadge tier={activeField.tier} />
                </div>
                <div className="text-xs text-[#64748B] mb-4">{activeField.cluster}</div>
                <p className="text-sm text-[#334155] mb-5 leading-6">{activeField.oneLiner}</p>

                {scored && (
                  <div className="mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ScoreBox label="Market Pull" value={scored.marketPull} />
                      <ScoreBox label="Technical Moat" value={scored.technicalMoat} />
                      <ScoreBox label="Accessibility" value={scored.accessibility} />
                      <ScoreBox label="Resume Signal" value={scored.resumeSignal} />
                    </div>
                    <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="text-xs font-medium text-[#475569]">Weighted score</span>
                        <span className="text-lg font-semibold font-mono text-[#4338CA]">{scored.weighted}<span className="text-xs text-[#94A3B8]"> / 10</span></span>
                      </div>
                      <div className="flex gap-1.5" aria-label={`Weighted score ${scored.weighted} out of 10`}>
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} className={`h-2 flex-1 rounded-sm ${i < Math.round(scored.weighted) ? "bg-[#6366F1]" : "bg-[#E2E8F0]"}`} />
                        ))}
                      </div>
                      <div className="mt-2"><SourceTag type="FACT" /></div>
                    </div>
                  </div>
                )}

                {detail && (
                  <div className="space-y-2">
                    <Collapsible title="2005-software-engineer analogue test" defaultOpen>
                      <p className="text-sm text-[#334155] whitespace-pre-line leading-6">{detail.analogue}</p>
                    </Collapsible>
                    <Collapsible title="Concrete roles across time">
                      {['2026', '2030', '2036'].map((y) => (
                        <div key={y} className="mb-4 last:mb-0">
                          <div className="flex items-center gap-2 text-xs font-mono text-[#4338CA] mb-1.5">
                            {y} {y === '2036' && <SourceTag type="SPECULATION" />}
                          </div>
                          <ul className="text-sm text-[#334155] list-disc list-inside space-y-1 leading-5">
                            {detail.roles[y].map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      ))}
                    </Collapsible>
                    <Collapsible title="Full 24-dimension score">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                        {DIMENSION_LABELS.map((label, i) => (
                          <div key={label} className="flex items-center justify-between text-xs py-2 border-b border-[#F1F5F9]">
                            <span className="text-[#64748B]">{label}</span>
                            <span className="font-mono text-[#0F172A]">{detail.scores[i]}</span>
                          </div>
                        ))}
                      </div>
                    </Collapsible>
                    <Collapsible title="Brutal honesty: overhyped / dead-end fields" badge={<span className="ml-1"><SourceTag type="INFERENCE" /></span>}>
                      <p className="text-sm text-[#334155] leading-6">This explorer is a research-backed ranking, not a guarantee. Fields marked Watchlist or Dead-end should be interpreted in the context of the documented assumptions and trade-offs in the research.</p>
                    </Collapsible>
                  </div>
                )}
              </Panel>
            )}
          </div>
        </div>
      )}

      {viewMode === "compare" && (
        <div>
          <p className="text-xs text-[#64748B] mb-3">Select up to 3 fields to compare side by side. Fields without a composite score (mostly Watchlist/Dead-end) show tier and summary only.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 max-h-56 overflow-y-auto pr-1">
            {filtered.map((f) => (
              <button key={f.id} onClick={() => toggleCompare(f.id)}
                disabled={!compareIds.includes(f.id) && compareIds.length >= 3}
                className={`text-left p-3 rounded-xl border text-xs transition-colors ${compareIds.includes(f.id) ? "border-[#6366F1] bg-[#EEF2FF] text-[#312E81]" : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#94A3B8] disabled:opacity-30"}`}>
                {f.name}
              </button>
            ))}
          </div>

          {compareIds.length === 0 && <EmptyState icon={Layers} title="Pick 2-3 fields above" sub="The comparison table renders once you've selected at least one." />}

          {compareIds.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {[
                    ["", ...compareIds.map((id) => FIELDS.find((f) => f.id === id)?.name)],
                    ["Tier", ...compareIds.map((id) => FIELDS.find((f) => f.id === id)?.tier)],
                    ["Market Pull", ...compareIds.map((id) => SCORED.find((s) => s.id === id)?.marketPull ?? "—")],
                    ["Technical Moat", ...compareIds.map((id) => SCORED.find((s) => s.id === id)?.technicalMoat ?? "—")],
                    ["Accessibility", ...compareIds.map((id) => SCORED.find((s) => s.id === id)?.accessibility ?? "—")],
                    ["Resume Signal", ...compareIds.map((id) => SCORED.find((s) => s.id === id)?.resumeSignal ?? "—")],
                    ["Weighted Score", ...compareIds.map((id) => SCORED.find((s) => s.id === id)?.weighted ?? "—")],
                    ["Summary", ...compareIds.map((id) => FIELDS.find((f) => f.id === id)?.oneLiner)],
                  ].map((row, ri) => (
                    <tr key={ri} className={ri === 0 ? "bg-[#F8FAFC]" : "border-t border-[#E2E8F0]"}>
                      <td className="py-3 px-4 text-xs font-mono text-[#64748B] align-top whitespace-nowrap">{row[0]}</td>
                      {row.slice(1).map((cell, ci) => (
                        <td key={ci} className={`py-3 pr-4 align-top ${ri === 0 ? "text-[#0F172A] font-medium" : ri === 1 ? "" : "text-[#334155]"}`}>
                          {ri === 1 ? <TierBadge tier={cell} /> : ri === 6 ? <span className="font-mono text-[#4338CA] text-base">{cell}</span> : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {viewMode === "timeline" && (
        <div>
          <p className="text-xs text-[#64748B] mb-4 flex items-center gap-2">
            Role progression for the 5 Tier-S fields. <SourceTag type="SPECULATION" /> marks the 2036 column — it's explicitly a guess, not a guarantee.
          </p>
          <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left py-3 px-4 text-xs font-mono text-[#64748B]">Field</th>
                  <th className="text-left py-3 pr-4 text-xs font-mono text-[#B45309]">2026</th>
                  <th className="text-left py-3 pr-4 text-xs font-mono text-[#4338CA]">2030</th>
                  <th className="text-left py-3 pr-4 text-xs font-mono text-[#7C3AED]">2036 <SourceTag type="SPECULATION" /></th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(TIER_S_DETAIL).map(([id, detail]) => {
                  const field = FIELDS.find((f) => f.id === id);
                  return (
                    <tr key={id} className="border-b border-[#F1F5F9] align-top">
                      <td className="py-3 px-4 text-[#0F172A] font-medium whitespace-nowrap">
                        <button onClick={() => { setViewMode("explore"); setSelected(id); }} className="hover:text-[#4338CA] text-left">{field?.name}</button>
                      </td>
                      {['2026', '2030', '2036'].map((y) => (
                        <td key={y} className="py-3 pr-4 text-[#334155]">
                          <ul className="list-disc list-inside space-y-1">
                            {detail.roles[y].map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBox({ label, value }) {
  const numeric = Number(value) || 0;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="text-[10px] uppercase tracking-wider text-[#64748B]">{label}</div>
        <div className="text-sm font-mono font-semibold text-[#0F172A]">{numeric}/10</div>
      </div>
      <div className="flex gap-1" aria-label={`${label} score ${numeric} out of 10`}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-sm ${i < numeric ? "bg-[#6366F1]" : "bg-[#E2E8F0]"}`} />
        ))}
      </div>
    </div>
  );
}

function SkillTreeView({ state, update, goTo, focusSkill }) {
  const [selected, setSelected] = useState(SKILL_NODES[0]?.id || null);
  useEffect(() => { if (focusSkill) setSelected(focusSkill); }, [focusSkill]);
  const node = SKILL_NODES.find((n) => n.id === selected);
  const skillState = state.skills[selected] || {};

  const setSkill = (patch) => update(["skills", selected], { ...skillState, ...patch });

  return (
    <div className="max-w-6xl">
      <SectionHeader eyebrow="PART VIII OF THE RESEARCH" title="Skill Dependency Graph" sub="Not a checklist — each node is a real prerequisite for the one below it." />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2">
          <div className="relative pl-4">
            {SKILL_NODES.map((n, i) => (
              <div key={n.id} className="relative">
                {i < SKILL_NODES.length - 1 && <div className="absolute left-[7px] top-6 w-px h-full bg-[#E2E8F0]" />}
                <button onClick={() => setSelected(n.id)}
                  className={`relative z-10 flex items-center gap-3 w-full text-left py-2 pl-0 pr-2 rounded ${selected === n.id ? "bg-[#FFFFFF]" : "hover:bg-[#FFFFFF]/50"}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex-shrink-0 border-2 ${
                    (state.skills[n.id]?.status === "demonstrated") ? "bg-[#E8A33D] border-[#E8A33D]" :
                    (state.skills[n.id]?.status === "built") ? "bg-[#6FBFAE] border-[#6FBFAE]" :
                    (state.skills[n.id]?.status === "understood") ? "bg-[#7FA7D9] border-[#7FA7D9]" :
                    (state.skills[n.id]?.status === "learning") ? "bg-[#D3A15E] border-[#D3A15E]" :
                    "bg-transparent border-[#94A3B8]"
                  }`} />
                  <span className={`text-sm ${selected === n.id ? "text-[#0F172A]" : "text-[#B8BDC7]"}`}>{n.name}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-3">
          {node && (
            <Panel className="p-5">
              <h2 className="text-lg font-semibold text-[#0F172A] mb-1">{node.name}</h2>
              <StatusPill status={skillState.status || "not_started"} />
              <div className="mt-4 space-y-4 text-sm">
                <div><div className="text-xs text-[#E8A33D] font-mono mb-1">WHAT IT IS</div><p className="text-[#334155]">{node.what}</p></div>
                <div><div className="text-xs text-[#E8A33D] font-mono mb-1">WHY IT MATTERS</div><p className="text-[#334155]">{node.why}</p></div>
                <div><div className="text-xs text-[#E8A33D] font-mono mb-1">PREREQUISITES</div><p className="text-[#334155]">{node.prereqs}</p></div>
                <div><div className="text-xs text-[#E8A33D] font-mono mb-1">BOOTCAMP DAY(S)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {node.days.map((d) => (
                      <button key={d} onClick={() => goTo("bootcamp", { day: d })} className="text-xs font-mono bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] px-2 py-0.5 rounded">Day {d}</button>
                    ))}
                  </div>
                </div>
                <div><div className="text-xs text-[#E8A33D] font-mono mb-1">LEARNING RESOURCES</div>
                  <ul className="text-[#334155] list-disc list-inside space-y-0.5">{node.resources.map((r, i) => <li key={i}>{r}</li>)}</ul>
                </div>
                <div><div className="text-xs text-[#E8A33D] font-mono mb-1">PRACTICAL EXERCISE</div><p className="text-[#334155]">{node.exercise}</p></div>
                <div><div className="text-xs text-[#E8A33D] font-mono mb-1">PROJECT CONNECTION</div><p className="text-[#334155]">{node.projectLink}</p></div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E2E8F0] space-y-3">
                <StatusSelector value={skillState.status || "not_started"} onChange={(v) => setSkill({ status: v })} />
                <ConfidenceSlider value={skillState.confidence || 0} onChange={(v) => setSkill({ confidence: v })} />
                <TextArea value={skillState.notes} onChange={(v) => setSkill({ notes: v })} placeholder="Your notes on this skill…" />
                <EvidenceBlock evidence={skillState.evidence} onChange={(v) => setSkill({ evidence: v })} />
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}



function BootcampView({ state, update, focusDay }) {
  const [openWeek, setOpenWeek] = useState(1);
  const [openDay, setOpenDay] = useState(focusDay || 1);

  useEffect(() => {
    if (focusDay) {
      const w = BOOTCAMP_WEEKS.find((w) => w.days.some((d) => d.day === focusDay));
      if (w) setOpenWeek(w.week);
      setOpenDay(focusDay);
    }
  }, [focusDay]);

  return (
    <div className="max-w-5xl">
      <SectionHeader eyebrow="30 DAYS · 4 WEEKS + BUFFER" title="The Extreme Bootcamp" sub="Every day from the source, made interactive: check tasks, answer mini-tests, attach evidence." />
      <ModeBanner mode={state.settings.mode} />

      <div className="flex gap-2 mb-6">
        {BOOTCAMP_WEEKS.map((w) => (
          <button key={w.week} onClick={() => setOpenWeek(w.week)}
            className={`text-xs font-mono px-3 py-1.5 rounded border ${openWeek === w.week ? "bg-[#E8A33D] text-[#14171C] border-[#E8A33D]" : "border-[#E2E8F0] text-[#64748B]"}`}>
            Week {w.week}
          </button>
        ))}
      </div>

      {BOOTCAMP_WEEKS.filter((w) => w.week === openWeek).map((w) => (
        <div key={w.week} className="space-y-3">
          <div className="text-sm text-[#64748B] mb-2">{w.title}</div>
          {w.days.map((d) => (
            <DayCard key={d.day} day={d} state={state} update={update} defaultOpen={d.day === openDay} />
          ))}
          {w.exam && <ExamCard exam={w.exam} state={state} update={update} />}
        </div>
      ))}
    </div>
  );
}

function ModeBanner({ mode }) {
  const text = {
    extreme: "EXTREME — one calendar day per bootcamp day, 6–10 focused hours.",
    normal: "NORMAL — stretch each bootcamp day across ~2 calendar days at a sustainable pace.",
    "college-heavy": "COLLEGE-HEAVY — stretch each bootcamp day across ~3–4 calendar days around classes.",
  };
  return (
    <div className="flex items-center gap-2 text-xs font-mono text-[#64748B] bg-[#FFFFFF] border border-[#E2E8F0] rounded px-3 py-2 mb-4">
      <Clock size={13} /> {text[mode] || text.extreme}
      <span className="text-[#64748B]">— curriculum content is identical in every mode; only pacing changes.</span>
    </div>
  );
}

function DayCard({ day, state, update, defaultOpen }) {
  const d = state.bootcamp[day.day] || {};
  const set = (patch) => update(["bootcamp", day.day], { ...d, ...patch });
  const [revealed, setRevealed] = useState(d.revealed || false);

  const taskKeys = ["deepWork", "build", "read"];
  const doneCount = taskKeys.filter((k) => d.tasks?.[k]).length;

  return (
    <Collapsible
      defaultOpen={defaultOpen}
      title={`Day ${day.day} — ${day.objective}`}
      badge={d.outputDone ? <CheckCircle2 size={14} className="text-[#6FBFAE] ml-2" /> : null}
      right={<span className="text-xs font-mono text-[#64748B]">{doneCount}/3</span>}
    >
      <div className="space-y-5 text-sm">
        <Field label="OBJECTIVE" text={day.objective} />
        <Field label="STUDY" text={day.study} />
        <div>
          <FieldLabel>MATERIALS</FieldLabel>
          <ul className="list-disc list-inside text-[#334155] space-y-0.5">{day.materials.map((m, i) => <li key={i}>{m}</li>)}</ul>
        </div>
        <TaskField label="DEEP WORK" text={day.deepWork} checked={!!d.tasks?.deepWork} onCheck={(v) => set({ tasks: { ...d.tasks, deepWork: v } })} />
        <TaskField label="BUILD" text={day.build} checked={!!d.tasks?.build} onCheck={(v) => set({ tasks: { ...d.tasks, build: v } })} />
        <TaskField label="READ" text={day.read} checked={!!d.tasks?.read} onCheck={(v) => set({ tasks: { ...d.tasks, read: v } })} />
        <Field label="THINK" text={day.think} />

        <div>
          <FieldLabel>MINI-TEST</FieldLabel>
          <div className="space-y-3">
            {day.miniTest.map((q, i) => (
              <div key={i} className="bg-[#FFFFFF] border border-[#E2E8F0] rounded p-3">
                <div className="text-[#334155] mb-1.5">{i + 1}. {q}</div>
                <TextArea rows={2} value={d.miniTest?.[i]} onChange={(v) => set({ miniTest: { ...(d.miniTest || {}), [i]: v } })} placeholder="Your answer — attempt before revealing…" />
              </div>
            ))}
          </div>
          <button onClick={() => { setRevealed(!revealed); set({ revealed: !revealed }); }} className="mt-2 text-xs font-mono text-[#E8A33D] border border-[#E8A33D]/40 rounded px-2 py-1 hover:bg-[#E8A33D]/10">
            {revealed ? "Hide answers" : "Reveal answers"}
          </button>
          {revealed && (
            <div className="mt-2 space-y-2">
              {day.answers.map((a, i) => (
                <div key={i} className="text-xs text-[#64748B] bg-[#FFFFFF] border border-[#E2E8F0] rounded p-2"><span className="text-[#6FBFAE] font-mono">A{i + 1}.</span> {a}</div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E2E8F0]">
          <div>
            <FieldLabel>OUTPUT</FieldLabel>
            <p className="text-[#334155] mb-2">{day.output}</p>
            <Checkbox checked={!!d.outputDone} onChange={(v) => set({ outputDone: v })} label="Output produced and committed" />
          </div>
          <div>
            <FieldLabel>CHECKPOINT</FieldLabel>
            <p className="text-[#334155] mb-2">{day.checkpoint}</p>
            <Checkbox checked={!!d.checkpointDone} onChange={(v) => set({ checkpointDone: v })} label="Can explain unaided" />
          </div>
        </div>

        <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
          <div className="flex items-center gap-4">
            <ConfidenceSlider value={d.confidence || 0} onChange={(v) => set({ confidence: v })} />
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-[#64748B]" />
              <input type="number" value={d.minutes || ""} onChange={(e) => set({ minutes: Number(e.target.value) })} placeholder="min" className="w-16 bg-[#FFFFFF] border border-[#E2E8F0] rounded px-2 py-1 text-xs text-[#0F172A]" />
            </div>
          </div>
          <TextArea value={d.notes} onChange={(v) => set({ notes: v })} placeholder="Notes for this day…" />
          <div className="grid grid-cols-2 gap-2">
            <TextField icon={Github} value={d.github} onChange={(v) => set({ github: v })} placeholder="GitHub commit/PR URL" />
            <TextField icon={Video} value={d.demo} onChange={(v) => set({ demo: v })} placeholder="Demo/screenshot URL" />
          </div>
        </div>
      </div>
    </Collapsible>
  );
}

function FieldLabel({ children }) { return <div className="text-xs text-[#E8A33D] font-mono mb-1">{children}</div>; }
function Field({ label, text }) { return <div><FieldLabel>{label}</FieldLabel><p className="text-[#334155]">{text}</p></div>; }
function TaskField({ label, text, checked, onCheck }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <Checkbox checked={checked} onChange={onCheck} label={text} />
    </div>
  );
}

function ExamCard({ exam, state, update }) {
  const e = state.exams[exam.id] || {};
  const set = (patch) => update(["exams", exam.id], { ...e, ...patch });
  return (
    <Panel className="p-5 mt-2 border-[#E8A33D]/30">
      <div className="flex items-center gap-2 mb-1">
        <Award size={16} className="text-[#E8A33D]" />
        <h3 className="text-base font-semibold text-[#0F172A]">{exam.title}</h3>
      </div>
      <p className="text-xs text-[#64748B] mb-4">{exam.gradingNote}</p>
      <div className="space-y-4">
        {exam.questions.map((q, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E2E8F0] rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-[#64748B]">{q.type}</span>
            </div>
            <div className="text-sm text-[#334155] mb-2">{q.prompt}</div>
            {q.options && (
              <div className="space-y-1 mb-2">
                {q.options.map((o, oi) => (
                  <label key={oi} className="flex items-center gap-2 text-xs text-[#B8BDC7]">
                    <input type="radio" name={`${exam.id}-${i}`} checked={e.answers?.[i] === oi} onChange={() => set({ answers: { ...(e.answers || {}), [i]: oi } })} />
                    {o}
                  </label>
                ))}
              </div>
            )}
            {!q.options && (
              <TextArea rows={2} value={e.answers?.[i]} onChange={(v) => set({ answers: { ...(e.answers || {}), [i]: v } })} placeholder="Your answer…" />
            )}
            {q.requiresOwnEvidence && <div className="text-[10px] text-[#D3A15E] mt-1 flex items-center gap-1"><Info size={11} /> Must reference your own project — no generic substitute counts here.</div>}
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div>
          <FieldLabel>WEAK AREA IDENTIFIED</FieldLabel>
          <TextArea rows={2} value={e.weakArea} onChange={(v) => set({ weakArea: v })} placeholder="Where did you struggle?" />
        </div>
        <div>
          <FieldLabel>FOLLOW-UP TASK</FieldLabel>
          <TextArea rows={2} value={e.followUp} onChange={(v) => set({ followUp: v })} placeholder="What will you redo/revisit?" />
        </div>
      </div>
    </Panel>
  );
}



function ProjectLabView({ state, update, goTo }) {
  const [level, setLevel] = useState("flagship");
  return (
    <div className="max-w-5xl">
      <SectionHeader eyebrow="PART X–XI OF THE RESEARCH" title="Project Lab" sub="3–5 excellent, defensible projects beat 20 shallow ones — the source is explicit about this." />
      <div className="flex gap-2 mb-6">
        {[["1", "Level 1 — Tiny"], ["2", "Level 2 — Intermediate"], ["3", "Level 3 — Advanced"], ["flagship", "Flagships"]].map(([k, label]) => (
          <button key={k} onClick={() => setLevel(k)} className={`text-xs font-mono px-3 py-1.5 rounded border ${level === k ? "bg-[#E8A33D] text-[#14171C] border-[#E8A33D]" : "border-[#E2E8F0] text-[#64748B]"}`}>{label}</button>
        ))}
      </div>

      {level !== "flagship" && (
        <div className="grid grid-cols-1 gap-2">
          {PROJECTS_L123[level].map((p, i) => <SimpleProjectCard key={i} project={p} id={`${level}-${i}`} state={state} update={update} />)}
        </div>
      )}

      {level === "flagship" && (
        <div className="space-y-4">
          {FLAGSHIPS.map((f) => <FlagshipCard key={f.id} flagship={f} state={state} update={update} goTo={goTo} />)}
        </div>
      )}
    </div>
  );
}

function SimpleProjectCard({ project, id, state, update }) {
  const p = (state && state.projects[id]) || {};
  return (
    <div className={`p-3 border rounded flex items-start gap-3 transition-colors ${p.completed ? "bg-[#ECFDF5] border-[#6FBFAE]/30" : "bg-[#FFFFFF] border-[#E2E8F0]"}`}>
      <button onClick={() => update(["projects", id], { ...p, completed: !p.completed })} className="flex-shrink-0 mt-0.5">
        {p.completed ? <CheckCircle2 size={16} className="text-[#6FBFAE]" /> : <Circle size={16} className="text-[#64748B]" />}
      </button>
      <div className={`text-sm ${p.completed ? "text-[#64748B] line-through" : "text-[#334155]"}`}>{project.title}</div>
    </div>
  );
}

const GATE_ITEMS = ["README", "Architecture diagram", "Setup instructions", "Reproducible environment", "Demo", "Tests", "Benchmark", "Failure analysis", "Limitations", "Security considerations", "Git history", "Technical report", "License", "GitHub repository", "Short explanation", "Interview questions prepared"];
const RESEARCH_GATE_ITEMS = ["Methodology", "Baseline", "Multiple runs", "Results", "Ablation", "Discussion", "Reproducibility notes"];

function relatedSkillsForFlagship(flagshipId) {
  const marker = `Flagship #${flagshipId}`;
  return SKILL_NODES.filter((n) => n.projectLink && n.projectLink.includes(marker));
}

function FlagshipCard({ flagship, state, update, goTo }) {
  const p = state.projects[flagship.id] || {};
  const set = (patch) => update(["projects", flagship.id], { ...p, ...patch });
  const gateChecked = Object.values(p.gate || {}).filter(Boolean).length;
  const gateTotal = GATE_ITEMS.length + (flagship.researchOriented ? RESEARCH_GATE_ITEMS.length : 0);
  const relatedSkills = relatedSkillsForFlagship(flagship.id);

  return (
    <Panel className="p-5">
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <div className="text-[10px] font-mono text-[#E8A33D]">FLAGSHIP #{flagship.id}{flagship.hedge && <span className="ml-2 text-[#9A98C9]">SECONDARY / HEDGE</span>}</div>
          <h3 className="text-lg font-semibold text-[#0F172A]">{flagship.title}</h3>
        </div>
        <StatusPill status={p.status || "not_started"} />
      </div>
      <p className="text-sm text-[#64748B] mb-3">{flagship.problem}</p>

      {relatedSkills.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span className="text-[10px] font-mono text-[#64748B] mr-1">DRAWS ON</span>
          {relatedSkills.map((s) => (
            <button key={s.id} onClick={() => goTo && goTo("skills", { skill: s.id })}
              className="text-[11px] font-mono bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#7FA7D9] px-2 py-0.5 rounded border border-[#E2E8F0]">
              {s.name}
            </button>
          ))}
        </div>
      )}

      <Collapsible title="Full project brief (problem, architecture, evaluation, resume angle)">
        <div className="space-y-3 text-sm">
          {flagship.fields.map(([label, text]) => (
            <div key={label}><FieldLabel>{label}</FieldLabel><p className="text-[#334155] whitespace-pre-line">{text}</p></div>
          ))}
        </div>
      </Collapsible>

      <div className="h-2" />
      <Collapsible title={`Quality gate (${gateChecked}/${gateTotal})`}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {GATE_ITEMS.map((g) => (
            <Checkbox key={g} checked={!!p.gate?.[g]} onChange={(v) => set({ gate: { ...p.gate, [g]: v } })} label={g} />
          ))}
          {flagship.researchOriented && RESEARCH_GATE_ITEMS.map((g) => (
            <Checkbox key={g} checked={!!p.gate?.[g]} onChange={(v) => set({ gate: { ...p.gate, [g]: v } })} label={g} />
          ))}
        </div>
      </Collapsible>

      <div className="h-2" />
      <Collapsible title="Evidence, benchmarks & notes">
        <div className="space-y-3">
          <EvidenceRow label="GitHub" icon={Github} value={p.github} onChange={(v) => set({ github: v })} />
          <EvidenceRow label="Demo" icon={Video} value={p.demo} onChange={(v) => set({ demo: v })} />
          <EvidenceRow label="Report" icon={FileText} value={p.techReport} onChange={(v) => set({ techReport: v })} />
          <TextArea value={p.benchmarks} onChange={(v) => set({ benchmarks: v })} placeholder="Real benchmark numbers (your own measured data)…" rows={3} />
          <TextArea value={p.ablations} onChange={(v) => set({ ablations: v })} placeholder="Ablation findings…" rows={2} />
          <TextArea value={p.securityFindings} onChange={(v) => set({ securityFindings: v })} placeholder="Security findings (if applicable)…" rows={2} />
          <TextArea value={p.notes} onChange={(v) => set({ notes: v })} placeholder="Other notes…" rows={2} />
        </div>
      </Collapsible>

      <div className="mt-4">
        <StatusSelector value={p.status || "not_started"} onChange={(v) => set({ status: v })} />
      </div>
    </Panel>
  );
}



const INTERVIEW_QUESTIONS = [
  "Explain the architecture, end to end.",
  "Why did you design it this way, and what else did you consider?",
  "What failed during the build, and how did you find out?",
  "What would you change if you started over today?",
  "What were the benchmarks, and how did you measure them?",
  "Why that metric, specifically, and not another one?",
  "What security risks exist in this system?",
  "What trade-offs did you make, and what did they cost you?",
  "How would you scale this beyond a single-device demo?",
  "What happens if the model, a tool call, or the device fails mid-task?",
  "What did you personally implement, versus what came from a library or framework?",
];

function PortfolioView({ state, update }) {
  return (
    <div className="max-w-5xl">
      <SectionHeader eyebrow="PART XII OF THE RESEARCH" title="Portfolio Signal" sub="Only claims backed by evidence you've actually recorded appear here as usable." />

      <Collapsible title="Skill → Project → Result → Evidence → Resume Signal" defaultOpen>
        <div className="space-y-2 overflow-x-auto">
          {RESUME_SIGNAL_TABLE.map((row, i) => (
            <div key={i} className="grid grid-cols-5 gap-2 text-xs items-center py-2 border-b border-[#F1F5F9] min-w-[640px]">
              <span className="text-[#E8A33D]">{row.skill}</span>
              <span className="text-[#334155]">{row.project}</span>
              <span className="text-[#64748B]">{row.result}</span>
              <span className="text-[#64748B]">{row.evidence}</span>
              <span className="text-[#6FBFAE]">{row.signal}</span>
            </div>
          ))}
        </div>
      </Collapsible>

      <div className="h-4" />
      <div className="text-sm font-medium text-[#0F172A] mb-3">Project records</div>
      <div className="space-y-3">
        {FLAGSHIPS.map((f) => <PortfolioProjectRecord key={f.id} flagship={f} state={state} update={update} />)}
      </div>
    </div>
  );
}

function fieldText(flagship, labelSubstr) {
  const hit = flagship.fields.find(([label]) => label.toLowerCase().includes(labelSubstr.toLowerCase()));
  return hit ? hit[1] : null;
}

function PortfolioProjectRecord({ flagship, state, update }) {
  const p = state.projects[flagship.id] || {};
  const set = (patch) => update(["projects", flagship.id], { ...p, ...patch });
  const hasResults = !!(p.benchmarks || p.techReport);
  const confidentCount = Object.values(p.interviewConfidence || {}).filter(Boolean).length;

  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between">
        <div className="font-medium text-[#0F172A] text-sm">{flagship.title}</div>
        <StatusPill status={p.status || "not_started"} />
      </div>
      <div className="text-xs text-[#64748B] mt-1">{flagship.problem}</div>
      <div className="mt-2 text-xs">
        <span className="text-[#64748B]">Results: </span>
        <span className={hasResults ? "text-[#6FBFAE]" : "text-[#D3A15E]"}>{hasResults ? (p.benchmarks || "See technical report.") : "Results not yet measured."}</span>
      </div>
      {p.github && <a href={p.github} target="_blank" rel="noreferrer" className="text-xs text-[#7FA7D9] flex items-center gap-1 mt-1"><Github size={11} /> {p.github}</a>}

      <div className="h-2" />
      <Collapsible title="LinkedIn / resume project record">
        <div className="space-y-2 text-sm">
          <RecordRow label="Project title" value={flagship.title} />
          <RecordRow label="One-line problem" value={flagship.problem} />
          <RecordRow label="Key technologies" value={fieldText(flagship, "technolog") || "Not specified in the brief."} />
          <RecordRow label="Technical approach / architecture" value={fieldText(flagship, "architecture") || fieldText(flagship, "scope") || "Not specified in the brief."} />
          <RecordRow label="Experiments & results" value={p.benchmarks || "Results not yet measured."} highlight={!p.benchmarks} />
          <RecordRow label="Ablation findings" value={p.ablations || "Not yet run."} highlight={!p.ablations} />
          <RecordRow label="Security findings" value={p.securityFindings || (flagship.researchOriented ? "N/A for this project." : "Not yet assessed.")} highlight={!p.securityFindings && !flagship.researchOriented} />
          <RecordRow label="GitHub" value={p.github || "Not linked yet."} highlight={!p.github} />
          <RecordRow label="Demo" value={p.demo || "Not linked yet."} highlight={!p.demo} />
          <RecordRow label="Technical report" value={p.techReport || "Not linked yet."} highlight={!p.techReport} />
          <RecordRow label="What makes it interesting" value={fieldText(flagship, "recruiters would find") || fieldText(flagship, "why highest-leverage") || fieldText(flagship, "why this fits") || "—"} />
          <RecordRow label="What was learned" value={p.notes || "Not recorded yet."} highlight={!p.notes} />
        </div>
      </Collapsible>

      <div className="h-2" />
      <Collapsible title={`Interview preparation (${confidentCount}/${INTERVIEW_QUESTIONS.length} confident)`}>
        <div className="space-y-2">
          {INTERVIEW_QUESTIONS.map((q, i) => (
            <div key={i} className="flex items-start gap-3 text-sm py-1.5 border-b border-[#F1F5F9] last:border-0">
              <span className="text-[#334155] flex-1">{q}</span>
              <button
                onClick={() => set({ interviewConfidence: { ...(p.interviewConfidence || {}), [i]: !(p.interviewConfidence || {})[i] } })}
                className={`text-[11px] font-mono px-2 py-1 rounded border flex-shrink-0 ${
                  (p.interviewConfidence || {})[i] ? "bg-[#6FBFAE] text-[#14171C] border-[#6FBFAE]" : "border-[#CBD5E1] text-[#64748B] hover:border-[#6FBFAE]/50"
                }`}
              >
                {(p.interviewConfidence || {})[i] ? "Confident" : "Not yet"}
              </button>
            </div>
          ))}
        </div>
      </Collapsible>
    </Panel>
  );
}

function RecordRow({ label, value, highlight }) {
  return (
    <div>
      <div className="text-[10px] font-mono text-[#64748B] uppercase tracking-wide">{label}</div>
      <div className={`text-sm ${highlight ? "text-[#D3A15E]" : "text-[#334155]"} whitespace-pre-line`}>{value}</div>
    </div>
  );
}



function OpenSourceView({ state, update }) {
  const os = state.openSource;
  const set = (patch) => update(["openSource"], { ...os, ...patch });
  return (
    <div className="max-w-4xl">
      <SectionHeader eyebrow="DAY 26 OF THE BOOTCAMP" title="Open Source Track" sub="A real, submitted pull request — not a cosmetic one." />
      <div className="space-y-2 mb-6">
        {OPEN_SOURCE_STEPS.map((s, i) => (
          <Checkbox key={i} checked={!!os.steps?.[i]} onChange={(v) => set({ steps: { ...os.steps, [i]: v } })} label={`${i + 1}. ${s}`} />
        ))}
      </div>
      <Panel className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <TextField icon={LinkIcon} value={os.issueUrl} onChange={(v) => set({ issueUrl: v })} placeholder="Issue URL" />
          <TextField icon={GitPullRequest} value={os.prUrl} onChange={(v) => set({ prUrl: v })} placeholder="Pull request URL" />
        </div>
        <div className="mb-3">
          <FieldLabel>STATUS</FieldLabel>
          <div className="flex gap-2">
            {["not_started", "submitted", "in_review", "changes_requested", "merged", "closed_unmerged"].map((s) => (
              <button key={s} onClick={() => set({ status: s })} className={`text-[11px] font-mono px-2 py-1 rounded border ${os.status === s ? "bg-[#E8A33D] text-[#14171C] border-[#E8A33D]" : "border-[#CBD5E1] text-[#64748B]"}`}>{s.replace("_", " ")}</button>
            ))}
          </div>
          <div className="text-[10px] text-[#64748B] mt-1">Submitted ≠ merged — tracked separately on purpose.</div>
        </div>
        <TextArea value={os.reviewComments} onChange={(v) => set({ reviewComments: v })} placeholder="Review comments received…" rows={2} />
        <div className="h-2" />
        <TextArea value={os.learned} onChange={(v) => set({ learned: v })} placeholder="What you learned from this contribution…" rows={2} />
      </Panel>
    </div>
  );
}



function OutreachyView({ state, update }) {
  const o = state.outreachy;
  const set = (key, patch) => update(["outreachy", key], { ...o[key], ...patch });

  return (
    <div className="max-w-5xl">
      <SectionHeader eyebrow="APP RECOMMENDATION — NOT IN THE SOURCE DOCS" title="Outreachy — May/August 2027 Preparation"
        sub="Outreachy runs open, remote, paid internships roughly twice a year and wasn't part of the original research — this track is a scaffold the app adds. Exact 2027 dates aren't published yet; confirm everything against outreachy.org as the round approaches." />

      {OUTREACHY_STAGES.map((stage) => (
        <Collapsible key={stage.id} title={stage.title} defaultOpen={stage.id === "stage1"} badge={<span className="ml-1"><SourceTag type="APP" /></span>}>
          <p className="text-xs text-[#64748B] mb-3">{stage.note}</p>
          <div className="space-y-1.5">
            {stage.items.map((item, i) => (
              <Checkbox key={i} checked={!!o[stage.id]?.[i]} onChange={(v) => set(stage.id, { [i]: v })} label={item} />
            ))}
          </div>
        </Collapsible>
      ))}
      <div className="h-2" />

      <Collapsible title="Contribution log">
        <ContributionLog log={o.contributionLog} onChange={(v) => update(["outreachy", "contributionLog"], v)} />
      </Collapsible>
      <div className="h-2" />

      <Collapsible title="Project matching table (fill in once the cohort's project list is public)">
        <ProjectMatchTable rows={o.projectCandidates} onChange={(v) => update(["outreachy", "projectCandidates"], v)} />
      </Collapsible>
      <div className="h-2" />

      <Collapsible title="Essay brainstorming space (you write it — this app won't)">
        <div className="text-xs text-[#D3A15E] flex items-center gap-1 mb-3"><AlertTriangle size={12} /> This app deliberately does not draft or ghostwrite your Outreachy essays. Use these prompts to think out loud in your own words.</div>
        {["Why do you want this internship, specifically?", "What personal experience shows you face systemic bias/underrepresentation in tech, per Outreachy's actual eligibility criteria?", "What have you already contributed, and what did you learn from it?", "What do you want to be true about your skills in 3 months that isn't true now?"].map((prompt, i) => (
          <div key={i} className="mb-3">
            <div className="text-sm text-[#334155] mb-1">{prompt}</div>
            <TextArea rows={3} value={o.essayNotes?.[i]} onChange={(v) => update(["outreachy", "essayNotes"], { ...o.essayNotes, [i]: v })} placeholder="Brainstorm in your own words…" />
            <div className="text-[10px] text-[#64748B] mt-0.5">{(o.essayNotes?.[i] || "").length} characters</div>
          </div>
        ))}
      </Collapsible>
    </div>
  );
}

function ContributionLog({ log = [], onChange }) {
  const add = () => onChange([...log, { date: "", project: "", what: "", mentorFeedback: "" }]);
  const upd = (i, patch) => onChange(log.map((r, ix) => (ix === i ? { ...r, ...patch } : r)));
  const del = (i) => onChange(log.filter((_, ix) => ix !== i));
  return (
    <div className="space-y-2">
      {log.map((r, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-center">
          <input className="col-span-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded px-2 py-1 text-xs text-[#0F172A]" placeholder="date" value={r.date} onChange={(e) => upd(i, { date: e.target.value })} />
          <input className="col-span-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded px-2 py-1 text-xs text-[#0F172A]" placeholder="project" value={r.project} onChange={(e) => upd(i, { project: e.target.value })} />
          <input className="col-span-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded px-2 py-1 text-xs text-[#0F172A]" placeholder="what you did" value={r.what} onChange={(e) => upd(i, { what: e.target.value })} />
          <input className="col-span-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded px-2 py-1 text-xs text-[#0F172A]" placeholder="mentor feedback" value={r.mentorFeedback} onChange={(e) => upd(i, { mentorFeedback: e.target.value })} />
          <button onClick={() => del(i)} aria-label="Delete contribution entry" className="col-span-1 text-[#D3746B]"><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={add} className="text-xs font-mono text-[#E8A33D] flex items-center gap-1"><Plus size={12} /> Add contribution</button>
    </div>
  );
}

const MATCH_FIELDS = ["project", "skills", "language", "difficulty", "goodFirstIssues", "mentorResponsiveness", "contributionTask", "userSkillMatch", "portfolioRelevance", "agenticRelevance", "edgeRelevance", "securityRelevance", "prepNeeded"];
function ProjectMatchTable({ rows = [], onChange }) {
  const add = () => onChange([...rows, Object.fromEntries(MATCH_FIELDS.map((f) => [f, ""]))]);
  const upd = (i, k, v) => onChange(rows.map((r, ix) => (ix === i ? { ...r, [k]: v } : r)));
  const del = (i) => onChange(rows.filter((_, ix) => ix !== i));
  const fitScore = (r) => {
    const nums = [r.userSkillMatch, r.portfolioRelevance, r.agenticRelevance, r.edgeRelevance, r.securityRelevance].map(Number).filter((n) => !isNaN(n));
    return nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : "—";
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead><tr className="text-[#64748B] text-left">{MATCH_FIELDS.map((f) => <th key={f} className="pr-3 pb-1 whitespace-nowrap capitalize">{f.replace(/([A-Z])/g, " $1")}</th>)}<th>Fit</th><th></th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-[#F1F5F9]">
              {MATCH_FIELDS.map((f) => (
                <td key={f} className="pr-2 py-1"><input className="w-24 bg-[#FFFFFF] border border-[#E2E8F0] rounded px-1.5 py-1 text-[#0F172A]" value={r[f]} onChange={(e) => upd(i, f, e.target.value)} /></td>
              ))}
              <td className="text-[#E8A33D] font-mono pr-2">{fitScore(r)}</td>
              <td><button onClick={() => del(i)} aria-label="Delete project candidate row" className="text-[#D3746B]"><Trash2 size={12} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={add} className="text-xs font-mono text-[#E8A33D] flex items-center gap-1 mt-2"><Plus size={12} /> Add project (only once the cohort's real list is public)</button>
    </div>
  );
}



function AcademicsView({ state, update }) {
  const subjects = state.academics.subjects.length ? state.academics.subjects : ACADEMIC_SEED;
  const setSubjects = (v) => update(["academics", "subjects"], v);

  useEffect(() => { if (!state.academics.subjects.length) setSubjects(ACADEMIC_SEED); }, []);

  const add = () => setSubjects([...subjects, { name: "New subject", units: "", weakTopics: "", notes: "", progress: 0, items: [] }]);
  const upd = (i, patch) => setSubjects(subjects.map((s, ix) => (ix === i ? { ...s, ...patch } : s)));
  const del = (i) => setSubjects(subjects.filter((_, ix) => ix !== i));

  const ITEM_TYPES = ["Lecture", "Assignment", "Practical", "Exam", "Revision"];
  const addItem = (i, type) => {
    const items = subjects[i].items || [];
    upd(i, { items: [...items, { type, title: "", done: false }] });
  };
  const updItem = (i, ii, patch) => {
    const items = (subjects[i].items || []).map((it, ix) => (ix === ii ? { ...it, ...patch } : it));
    upd(i, { items });
  };
  const delItem = (i, ii) => {
    const items = (subjects[i].items || []).filter((_, ix) => ix !== ii);
    upd(i, { items });
  };

  return (
    <div className="max-w-4xl">
      <SectionHeader eyebrow="ACADEMICS NEVER GET ERASED BY CAREER TASKS" title="Academic Dashboard" sub="Coursework, DSA, and core CS tracked alongside — not beneath — the career sprint." />
      <div className="space-y-3">
        {subjects.map((s, i) => {
          const items = s.items || [];
          const doneCount = items.filter((it) => it.done).length;
          return (
          <Panel key={i} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <input className="bg-transparent text-sm font-medium text-[#0F172A] outline-none border-b border-transparent focus:border-[#E8A33D] flex-1" value={s.name} onChange={(e) => upd(i, { name: e.target.value })} />
              <button onClick={() => del(i)} aria-label={`Delete subject ${s.name}`} className="text-[#D3746B]"><Trash2 size={13} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <TextField value={s.units} onChange={(v) => upd(i, { units: v })} placeholder="Units / topics covered" />
              <TextField value={s.weakTopics} onChange={(v) => upd(i, { weakTopics: v })} placeholder="Weak topics" />
            </div>
            <TextArea rows={2} value={s.notes} onChange={(v) => upd(i, { notes: v })} placeholder="Notes, assignments, exam prep…" />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-[#64748B] w-16">Progress</span>
              <input type="range" min="0" max="100" value={s.progress || 0} onChange={(e) => upd(i, { progress: Number(e.target.value) })} className="flex-1 accent-[#E8A33D]" />
              <span className="text-xs font-mono text-[#E8A33D] w-8">{s.progress || 0}%</span>
            </div>

            <div className="mt-3">
              <Collapsible title={`Lectures, assignments, practicals, exams, revision (${doneCount}/${items.length})`}>
                <div className="space-y-1.5 mb-3">
                  {items.map((it, ii) => (
                    <div key={ii} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#64748B] w-20 flex-shrink-0">{it.type}</span>
                      <Checkbox checked={it.done} onChange={(v) => updItem(i, ii, { done: v })} label={it.title || "(untitled)"} />
                      <input className="flex-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded px-2 py-1 text-xs text-[#0F172A]" placeholder="Title" value={it.title} onChange={(e) => updItem(i, ii, { title: e.target.value })} />
                      <button onClick={() => delItem(i, ii)} aria-label="Delete academic item" className="text-[#D3746B] flex-shrink-0"><Trash2 size={12} /></button>
                    </div>
                  ))}
                  {items.length === 0 && <div className="text-xs text-[#64748B]">Nothing tracked yet — add a lecture, assignment, practical, exam, or revision item below.</div>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ITEM_TYPES.map((t) => (
                    <button key={t} onClick={() => addItem(i, t)} className="text-[11px] font-mono px-2 py-1 rounded border border-[#E2E8F0] text-[#64748B] hover:border-[#E8A33D]/50 hover:text-[#0F172A] flex items-center gap-1">
                      <Plus size={10} /> {t}
                    </button>
                  ))}
                </div>
              </Collapsible>
            </div>
          </Panel>
          );
        })}
      </div>
      <button onClick={add} className="mt-3 text-xs font-mono text-[#E8A33D] flex items-center gap-1"><Plus size={12} /> Add subject</button>
    </div>
  );
}



function IotView({ state, update }) {
  const checks = state.iot.checks || {};
  return (
    <div className="max-w-4xl">
      <SectionHeader eyebrow="CONNECTED TO EDGE AI — NOT A SEPARATE CURRICULUM" title="IoT Track" sub="Not every AI skill is automatically an IoT skill. Here's exactly where they actually overlap." />
      <div className="relative pl-4">
        {IOT_CHAIN.map((step, i) => (
          <div key={i} className="relative pb-6">
            {i < IOT_CHAIN.length - 1 && <div className="absolute left-[5px] top-4 w-px h-full bg-[#E2E8F0]" />}
            <div className="flex gap-3">
              <span className="w-3 h-3 rounded-full bg-[#E8A33D] mt-1 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-[#0F172A]">{step.title}</div>
                <div className="text-xs text-[#64748B] mt-0.5">{step.desc}</div>
                {step.skillLink && <div className="text-[10px] font-mono text-[#7FA7D9] mt-1">→ Skill Tree: {step.skillLink}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-2" />
      <Collapsible title="Optional exploration (not mandatory bootcamp content)">
        {["Read your target device's NPU/DSP spec sheet and note its power budget in mW.", "Identify one sensor-driven use case where cloud round-trip latency would be unacceptable.", "Compare one microcontroller-class chip vs. one smartphone-class NPU on the constraints that matter for on-device inference."].map((item, i) => (
          <Checkbox key={i} checked={!!checks[i]} onChange={(v) => update(["iot", "checks"], { ...checks, [i]: v })} label={item} />
        ))}
      </Collapsible>
    </div>
  );
}



function LibraryView() {
  const [cat, setCat] = useState("All");
  const cats = ["All", ...Array.from(new Set(RESEARCH_LIBRARY.map((r) => r.category)))];
  const filtered = cat === "All" ? RESEARCH_LIBRARY : RESEARCH_LIBRARY.filter((r) => r.category === cat);
  return (
    <div className="max-w-4xl">
      <SectionHeader eyebrow="THE FULL RESEARCH DOCUMENT, SEARCHABLE" title="Research Library" sub="Every capital-flow fact from the source, tagged and filterable." />
      <div className="flex flex-wrap gap-2 mb-4">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`text-xs font-mono px-2.5 py-1 rounded border ${cat === c ? "bg-[#E8A33D] text-[#14171C] border-[#E8A33D]" : "border-[#E2E8F0] text-[#64748B]"}`}>{c}</button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((r, i) => (
          <div key={i} className="p-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-[#64748B]">{r.category}</span>
              <SourceTag type={r.tag} />
            </div>
            <p className="text-sm text-[#334155]">{r.text}</p>
            {r.source && <p className="text-[10px] text-[#64748B] mt-1">{r.source}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}



function ProgressView({ state }) {
  const skillCounts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = Object.values(state.skills).filter((v) => v.status === s).length;
    return acc;
  }, {});
  const totalDays = BOOTCAMP_WEEKS.reduce((s, w) => s + w.days.length, 0);
  const doneDays = Object.values(state.bootcamp).filter((d) => d?.outputDone).length;

  const flagshipStatusCounts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = FLAGSHIPS.filter((f) => (state.projects[f.id]?.status || "not_started") === s).length;
    return acc;
  }, {});
  const flagshipsDemonstrated = flagshipStatusCounts.demonstrated || 0;

  const totalLadderProjects = Object.values(PROJECTS_L123).reduce((s, arr) => s + arr.length, 0);
  const ladderCompleted = Object.entries(PROJECTS_L123).reduce((sum, [level, arr]) => {
    return sum + arr.filter((_, i) => state.projects[`${level}-${i}`]?.completed).length;
  }, 0);

  const flagshipsWithEvidence = FLAGSHIPS.filter((f) => {
    const p = state.projects[f.id] || {};
    return !!(p.github || p.demo || p.techReport || p.benchmarks);
  }).length;

  const subjects = state.academics.subjects.length ? state.academics.subjects : ACADEMIC_SEED;
  const avgAcademicProgress = subjects.length ? Math.round(subjects.reduce((s, sub) => s + (sub.progress || 0), 0) / subjects.length) : 0;
  const allAcademicItems = subjects.flatMap((s) => s.items || []);
  const doneAcademicItems = allAcademicItems.filter((it) => it.done).length;

  const openSourceSteps = Object.values(state.openSource.steps || {}).filter(Boolean).length;

  const outreachyStageCompletion = OUTREACHY_STAGES.map((stage) => {
    const checked = Object.values(state.outreachy[stage.id] || {}).filter(Boolean).length;
    return { id: stage.id, title: stage.title, checked, total: stage.items.length };
  });

  return (
    <div className="max-w-4xl">
      <SectionHeader eyebrow="EVIDENCE, NOT VIBES" title="Career Moat Dashboard" sub="No fabricated readiness percentage — just what's actually built, demonstrated, and evidenced." />

      <div className="grid grid-cols-3 gap-4 mb-4">
        <Panel className="p-4"><div className="text-xs text-[#64748B] mb-1">Bootcamp days complete</div><div className="text-2xl font-mono text-[#0F172A]">{doneDays}/{totalDays}</div></Panel>
        <Panel className="p-4"><div className="text-xs text-[#64748B] mb-1">Skills demonstrated</div><div className="text-2xl font-mono text-[#E8A33D]">{skillCounts.demonstrated || 0}<span className="text-sm text-[#64748B]">/{SKILL_NODES.length}</span></div></Panel>
        <Panel className="p-4"><div className="text-xs text-[#64748B] mb-1">Flagships demonstrated</div><div className="text-2xl font-mono text-[#6FBFAE]">{flagshipsDemonstrated}/{FLAGSHIPS.length}</div></Panel>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Panel className="p-4"><div className="text-xs text-[#64748B] mb-1">Project ladder (L1-3) complete</div><div className="text-2xl font-mono text-[#7FA7D9]">{ladderCompleted}/{totalLadderProjects}</div></Panel>
        <Panel className="p-4"><div className="text-xs text-[#64748B] mb-1">Flagships with real evidence</div><div className="text-2xl font-mono text-[#9A98C9]">{flagshipsWithEvidence}/{FLAGSHIPS.length}</div></Panel>
        <Panel className="p-4"><div className="text-xs text-[#64748B] mb-1">Academic progress (avg)</div><div className="text-2xl font-mono text-[#D3A15E]">{avgAcademicProgress}%</div></Panel>
      </div>

      <Collapsible title="Skill status breakdown" defaultOpen>
        <div className="space-y-2">
          {STATUS_ORDER.map((s) => (
            <div key={s} className="flex items-center gap-3">
              <span className="w-28 text-xs text-[#64748B]">{STATUS_LABEL[s]}</span>
              <ProgressBar value={skillCounts[s]} max={SKILL_NODES.length || 1} />
              <span className="text-xs font-mono text-[#0F172A] w-6">{skillCounts[s]}</span>
            </div>
          ))}
        </div>
      </Collapsible>

      <div className="h-2" />
      <Collapsible title="Flagship project status breakdown">
        <div className="space-y-2">
          {STATUS_ORDER.map((s) => (
            <div key={s} className="flex items-center gap-3">
              <span className="w-28 text-xs text-[#64748B]">{STATUS_LABEL[s]}</span>
              <ProgressBar value={flagshipStatusCounts[s]} max={FLAGSHIPS.length || 1} colorClass="bg-[#6FBFAE]" />
              <span className="text-xs font-mono text-[#0F172A] w-6">{flagshipStatusCounts[s]}</span>
            </div>
          ))}
        </div>
      </Collapsible>

      <div className="h-2" />
      <Collapsible title="Academic progress detail">
        <div className="space-y-2 mb-3">
          {subjects.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-40 text-xs text-[#64748B] truncate">{s.name}</span>
              <ProgressBar value={s.progress || 0} max={100} colorClass="bg-[#D3A15E]" />
              <span className="text-xs font-mono text-[#0F172A] w-10">{s.progress || 0}%</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-[#64748B]">Lectures/assignments/practicals/exams/revision items done: <span className="font-mono text-[#0F172A]">{doneAcademicItems}/{allAcademicItems.length}</span></div>
      </Collapsible>

      <div className="h-2" />
      <Collapsible title="Portfolio evidence">
        <p className="text-xs text-[#64748B] mb-2">Counted only when a real GitHub/demo/report link or benchmark note has been entered — not from status alone.</p>
        <div className="space-y-1.5">
          {FLAGSHIPS.map((f) => {
            const p = state.projects[f.id] || {};
            const has = !!(p.github || p.demo || p.techReport || p.benchmarks);
            return (
              <div key={f.id} className="flex items-center gap-2 text-sm">
                {has ? <CheckCircle2 size={14} className="text-[#6FBFAE] flex-shrink-0" /> : <Circle size={14} className="text-[#64748B] flex-shrink-0" />}
                <span className={has ? "text-[#334155]" : "text-[#64748B]"}>{f.title}</span>
              </div>
            );
          })}
        </div>
      </Collapsible>

      <div className="h-2" />
      <Collapsible title="Opportunity pipeline — Open Source & Outreachy" defaultOpen>
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="w-40 text-xs text-[#64748B]">Open-source steps</span>
            <ProgressBar value={openSourceSteps} max={OPEN_SOURCE_STEPS.length} colorClass="bg-[#7FA7D9]" />
            <span className="text-xs font-mono text-[#0F172A] w-10">{openSourceSteps}/{OPEN_SOURCE_STEPS.length}</span>
          </div>
          <div className="text-xs text-[#64748B] ml-0">Status: <StatusPill status={state.openSource.status && state.openSource.status !== "not_started" ? "learning" : "not_started"} /> <span className="font-mono text-[#0F172A]">{(state.openSource.status || "not_started").replace("_", " ")}</span></div>
        </div>
        <div className="space-y-2">
          {outreachyStageCompletion.map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <span className="w-40 text-xs text-[#64748B] truncate">{s.title.replace("Stage ", "S")}</span>
              <ProgressBar value={s.checked} max={s.total || 1} colorClass="bg-[#9A98C9]" />
              <span className="text-xs font-mono text-[#0F172A] w-10">{s.checked}/{s.total}</span>
            </div>
          ))}
        </div>
      </Collapsible>
    </div>
  );
}



function SettingsView({ state, update, resetAll }) {
  const [confirmReset, setConfirmReset] = useState(false);

  const exportData = async () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "career-os-export.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        update([], parsed);
      } catch (err) { alert("Invalid file."); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl">
      <SectionHeader eyebrow="INTENSITY & DATA" title="Settings" />
      <Panel className="p-5 mb-4">
        <FieldLabel>BOOTCAMP MODE</FieldLabel>
        <p className="text-xs text-[#64748B] mb-3">The source plan is 6–10 focused hours/day — that's the original intensity, not a mandatory lifestyle rule. Changing mode only changes the suggested pacing banner; every day's content stays identical.</p>
        <div className="flex gap-2">
          {["extreme", "normal", "college-heavy"].map((m) => (
            <button key={m} onClick={() => update(["settings", "mode"], m)} className={`text-xs font-mono px-3 py-1.5 rounded border capitalize ${state.settings.mode === m ? "bg-[#E8A33D] text-[#14171C] border-[#E8A33D]" : "border-[#E2E8F0] text-[#64748B]"}`}>{m}</button>
          ))}
        </div>
      </Panel>

      <Panel className="p-5">
        <FieldLabel>DATA</FieldLabel>
        <div className="flex gap-2 mb-3">
          <button onClick={exportData} className="text-xs font-mono px-3 py-1.5 rounded border border-[#E2E8F0] text-[#334155] flex items-center gap-1.5 hover:border-[#6FBFAE]/50"><Download size={12} /> Export data</button>
          <label className="text-xs font-mono px-3 py-1.5 rounded border border-[#E2E8F0] text-[#334155] flex items-center gap-1.5 hover:border-[#7FA7D9]/50 cursor-pointer">
            <Upload size={12} /> Import data
            <input type="file" accept="application/json" onChange={importData} className="hidden" />
          </label>
        </div>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="text-xs font-mono px-3 py-1.5 rounded border border-[#D3746B]/40 text-[#D3746B] flex items-center gap-1.5"><RotateCcw size={12} /> Reset all progress</button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#D3746B]">This deletes everything permanently. Sure?</span>
            <button onClick={() => { resetAll(); setConfirmReset(false); }} className="text-xs font-mono px-2 py-1 rounded bg-[#D3746B] text-[#14171C]">Yes, reset</button>
            <button onClick={() => setConfirmReset(false)} className="text-xs font-mono px-2 py-1 rounded border border-[#E2E8F0] text-[#64748B]">Cancel</button>
          </div>
        )}
      </Panel>
    </div>
  );
}
