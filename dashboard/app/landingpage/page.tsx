"use client"
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Activity,
  GitBranch,
  Zap,
  Bug,
  Users,
  BarChart3,
  Terminal as TerminalIcon,
  ChevronDown,
  ArrowRight,
  Github,
  MessageCircle,
  BookOpen,
  Boxes,
  Radio,
  ArrowUpRight,
  Check,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
 import Link from "next/link";
/* ----------------------------------------------------------------------- */
/* Utilities                                                                */
/* ----------------------------------------------------------------------- */
 
function useReveal(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.unobserve(node);
          }
        });
      },
      { threshold }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}
 
function Reveal({ children, delay = 0, className = "", as = "div" }) {
  const [ref, visible] = useReveal();
  const Tag = as;
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "reveal-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
 
function useCountUp(target, duration = 1600, active = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    let raf;
    const step = (ts) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return value;
}
 
/* ----------------------------------------------------------------------- */
/* Shared decorative bits                                                   */
/* ----------------------------------------------------------------------- */
 
function Logo({ size = 22 }) {
  return (
    <span className="tf-logo">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M4 12c2 0 2-5 5-5s3 5 5 5 2-5 5-5"
          stroke="url(#lg1)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4 12c2 0 2 5 5 5s3-5 5-5 2 5 5 5"
          stroke="url(#lg2)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.55"
        />
        <defs>
          <linearGradient id="lg1" x1="4" y1="7" x2="19" y2="7">
            <stop stopColor="#818cf8" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="lg2" x1="4" y1="17" x2="19" y2="17">
            <stop stopColor="#34d399" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <span className="tf-logo-word">TraceFlow</span>
    </span>
  );
}
 
/* ----------------------------------------------------------------------- */
/* Navbar                                                                    */
/* ----------------------------------------------------------------------- */
 
function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [action,setaction]=useState();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = ["Product", "Pricing", "Docs"];
  const linked=[
    { name:"Product", path:"/product" },
    { name:"Pricing", path:"#pricing" },
    { name:"Docs", path:"../traceflow-docs" }
  ]
  return (
    <header className={`tf-nav ${scrolled ? "tf-nav-scrolled" : ""}`}>
      <div className="tf-nav-inner">
        <Logo />
        <nav className="tf-nav-links">
          {linked.map((l) => (
            <a key={l.name} href={l.path} className="tf-nav-link">
              {l.name}
            </a>
          ))}
        </nav>
        <div className="tf-nav-actions">
          <Link href="/login" className="tf-nav-link tf-nav-login">
            Log in
          </Link>
          <button className="tf-btn tf-btn-ghost">Dashboard</button>
        <Link
  href="/register"
  className="tf-btn tf-btn-solid"
  style={{ color: "#05070d" }}
>
  Get started
</Link>
        </div>
        <button
          className="tf-nav-burger"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      {open && (
        <div className="tf-nav-mobile">
          {linked.map((l) => (
            <a key={l.name} href={l.path}>
              {l.name}
            </a>
          ))}
          <button className="tf-btn tf-btn-solid" style={{ width: "100%" }}>
            Get started
          </button>
        </div>
      )}
    </header>
  );
}
 
/* ----------------------------------------------------------------------- */
/* Hero — trace graph visualization                                         */
/* ----------------------------------------------------------------------- */
 
const HERO_NODES = [
  { id: "client", x: 60, y: 150, label: "client", ms: null },
  { id: "gateway", x: 210, y: 60, label: "gateway", ms: 4 },
  { id: "auth", x: 210, y: 240, label: "auth-svc", ms: 8 },
  { id: "orders", x: 380, y: 30, label: "orders-svc", ms: 22 },
  { id: "billing", x: 380, y: 130, label: "billing-svc", ms: 41 },
  { id: "inventory", x: 380, y: 230, label: "inventory-svc", ms: 17 },
  { id: "db", x: 380, y: 300, label: "postgres", ms: 63 },
];
 
const HERO_EDGES = [
  ["client", "gateway"],
  ["client", "auth"],
  ["gateway", "orders"],
  ["gateway", "billing"],
  ["auth", "inventory"],
  ["billing", "db"],
  ["inventory", "db"],
];
 
function HeroGraph() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % HERO_EDGES.length), 900);
    return () => clearInterval(id);
  }, []);
  const find = (id) => HERO_NODES.find((n) => n.id === id);
 
  return (
    <div className="tf-hero-graph">
      <svg viewBox="0 0 460 330" className="tf-hero-svg">
        {HERO_EDGES.map(([a, b], i) => {
          const A = find(a);
          const B = find(b);
          const isActive = i === active;
          return (
            <line
              key={i}
              x1={A.x}
              y1={A.y}
              x2={B.x}
              y2={B.y}
              className={`tf-edge ${isActive ? "tf-edge-active" : ""}`}
            />
          );
        })}
        {HERO_EDGES.map(([a, b], i) => {
          if (i !== active) return null;
          const A = find(a);
          const B = find(b);
          return (
            <circle key={"p" + i} r="3.5" className="tf-pulse-dot">
              <animate
                attributeName="cx"
                values={`${A.x};${B.x}`}
                dur="0.85s"
                fill="freeze"
              />
              <animate
                attributeName="cy"
                values={`${A.y};${B.y}`}
                dur="0.85s"
                fill="freeze"
              />
            </circle>
          );
        })}
        {HERO_NODES.map((n) => (
          <g key={n.id} transform={`translate(${n.x},${n.y})`} className="tf-node-g">
            <circle r="15" className="tf-node-ring" />
            <circle r="5.5" className="tf-node-core" />
            <text y="-24" textAnchor="middle" className="tf-node-label">
              {n.label}
            </text>
            {n.ms && (
              <text y="30" textAnchor="middle" className="tf-node-ms">
                {n.ms}ms
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="tf-hero-graph-footer">
        <span className="tf-live-dot" /> live trace &middot; req_8f2a19c
      </div>
    </div>
  );
}
 
function Hero() {
  return (
    <section className="tf-hero">
      <div className="tf-grid-bg" />
      <div className="tf-noise" />
      <div className="tf-glow tf-glow-a" />
      <div className="tf-glow tf-glow-b" />
      <div className="tf-hero-inner">
        <Reveal className="tf-eyebrow">
          <Sparkles size={13} /> request-first tracing for backend developers
        </Reveal>
        <Reveal delay={80}>
          <h1 className="tf-h1">
            See every request,
            <br />
            <span className="tf-h1-accent">before it becomes an incident.</span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="tf-hero-sub">
            TraceFlow is a request-first API and tracing tool for backend developers —
            capture a request, inspect its trace, and get more context without
            leaving the same workflow.
          </p>
        </Reveal>
        <Reveal delay={240} className="tf-hero-ctas">
          <button className="tf-btn tf-btn-solid tf-btn-lg">
            Explore TraceFlow <ArrowRight size={16} />
          </button>
          <button className="tf-btn tf-btn-outline tf-btn-lg">
            <TerminalIcon size={15} /> Inspect a request
          </button>
        </Reveal>
        <Reveal delay={340} className="tf-hero-visual">
          <HeroGraph />
        </Reveal>
      </div>
    </section>
  );
}
 
/* ----------------------------------------------------------------------- */
/* Trusted by                                                                */
/* ----------------------------------------------------------------------- */
 
function TrustedBy() {
  const names = [
    "EXPRESS", "NODE.JS", "BACKEND", "REQUESTS", "TRACES",
    "API", "DEBUGGING", "OBSERVABILITY", "TRACEFLOW", "DEVELOPER",
  ];
  const row = [...names, ...names];
  return (
    <section className="tf-trusted">
      <Reveal className="tf-trusted-label">
        Built around the problems backend developers actually face
      </Reveal>
      <div className="tf-marquee">
        <div className="tf-marquee-track">
          {row.map((n, i) => (
            <span key={i} className="tf-marquee-item">
              {n}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
 
/* ----------------------------------------------------------------------- */
/* Features — asymmetric bento layout                                       */
/* ----------------------------------------------------------------------- */
 
function SparkLine({ color }) {
  return (
    <svg viewBox="0 0 100 32" className="tf-spark">
      <polyline
        points="0,24 12,20 24,26 36,12 48,17 60,6 72,14 84,4 100,10"
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
}
 
function FeatureWaterfall() {
  const rows = [
    { w: 92, o: 0, c: "var(--indigo)" },
    { w: 60, o: 8, c: "var(--cyan)" },
    { w: 34, o: 24, c: "var(--emerald)" },
    { w: 20, o: 40, c: "var(--indigo)" },
  ];
  return (
    <div className="tf-mini-waterfall">
      {rows.map((r, i) => (
        <div key={i} className="tf-mini-wf-row">
          <div
            className="tf-mini-wf-bar"
            style={{ width: `${r.w}%`, marginLeft: `${r.o}%`, background: r.c }}
          />
        </div>
      ))}
    </div>
  );
}
 
function FeatureGraph() {
  return (
    <svg viewBox="0 0 160 90" className="tf-mini-graph">
      <line x1="20" y1="45" x2="80" y2="20" className="tf-edge" />
      <line x1="20" y1="45" x2="80" y2="70" className="tf-edge" />
      <line x1="80" y1="20" x2="140" y2="45" className="tf-edge" />
      <line x1="80" y1="70" x2="140" y2="45" className="tf-edge" />
      {[[20, 45], [80, 20], [80, 70], [140, 45]].map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="5" className="tf-node-core" />
      ))}
    </svg>
  );
}
 
const FEATURES = [
  {
    icon: GitBranch,
    title: "Request tracing",
    desc: "Capture API requests as traces and inspect the information attached to each request.",
    span: "wide",
    color: "var(--indigo)",
    visual: <FeatureGraph />,
  },
  {
    icon: Activity,
    title: "Request details",
    desc: "See method, route, status, duration, and other request information in one place.",
    span: "tall",
    color: "var(--cyan)",
    visual: <SparkLine color="#22d3ee" />,
  },
  {
    icon: BarChart3,
    title: "Trace history",
    desc: "Review captured traces for a project and find slow or failed requests faster.",
    span: "normal",
    color: "var(--emerald)",
    visual: <SparkLine color="#34d399" />,
  },
  {
    icon: Layers,
    title: "Project trace explorer",
    desc: "Keep traces organized by project so you can move from an application to the requests it has captured.",
    span: "normal",
    color: "var(--indigo)",
    visual: <FeatureWaterfall />,
  },
  {
    icon: Bug,
    title: "Response context",
    desc: "See status codes and request timing together, giving failed or slow calls more context.",
    span: "tall",
    color: "var(--cyan)",
    visual: null,
  },
  {
    icon: Users,
    title: "API workflow",
    desc: "Hit an API, inspect its response, and use the same workflow to understand what happened to the request.",
    span: "wide",
    color: "var(--emerald)",
    visual: null,
  },
];
 
function FeatureCard({ f, i }) {
  const Icon = f.icon;
  return (
    <Reveal delay={i * 70} className={`tf-feat tf-feat-${f.span}`}>
      <div className="tf-feat-inner">
        <div className="tf-feat-top">
          <div className="tf-feat-icon" style={{ color: f.color }}>
            <Icon size={18} />
          </div>
          <ArrowUpRight size={15} className="tf-feat-arrow" />
        </div>
        <h3 className="tf-feat-title">{f.title}</h3>
        <p className="tf-feat-desc">{f.desc}</p>
        {f.visual && <div className="tf-feat-visual">{f.visual}</div>}
      </div>
    </Reveal>
  );
}
 
function Features() {
  return (
    <section className="tf-section">
      <Reveal className="tf-section-head">
        <span className="tf-eyebrow">capabilities</span>
        <h2 className="tf-h2">Everything an on-call engineer actually opens</h2>
        <p className="tf-section-sub">
          Six tools that share one trace model, so context never gets lost
          between them.
        </p>
      </Reveal>
      <div className="tf-feat-grid">
        {FEATURES.map((f, i) => (
          <FeatureCard f={f} i={i} key={f.title} />
        ))}
      </div>
    </section>
  );
}
 
/* ----------------------------------------------------------------------- */
/* How it works — vertical pipeline                                         */
/* ----------------------------------------------------------------------- */
 
const STAGES = [
  { label: "API Request", detail: "send the request", ms: "01" },
  { label: "Trace Capture", detail: "record request context", ms: "02" },
  { label: "Trace Details", detail: "inspect method + route + status + duration", ms: "03" },
  { label: "Project Dashboard", detail: "review captured requests", ms: "04" },
];
 
function HowItWorks() {
  const [active, setActive] = useState(0);
  const [ref, visible] = useReveal(0.3);
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setActive((a) => (a + 1) % STAGES.length), 1100);
    return () => clearInterval(id);
  }, [visible]);
 
  return (
    <section className="tf-section" ref={ref}>
      <Reveal className="tf-section-head">
        <span className="tf-eyebrow">the request lifecycle</span>
        <h2 className="tf-h2">One request, from call to context</h2>
        <p className="tf-section-sub">
          Make the request. Capture the trace. Inspect what happened.
        </p>
      </Reveal>
 
      <div className="tf-pipeline">
        <div className="tf-pipeline-track">
          <div
            className="tf-pipeline-progress"
            style={{ height: `${(active / (STAGES.length - 1)) * 100}%` }}
          />
          <div
            className="tf-pipeline-dot"
            style={{ top: `${(active / (STAGES.length - 1)) * 100}%` }}
          />
        </div>
        <ol className="tf-pipeline-list">
          {STAGES.map((s, i) => (
            <li
              key={s.label}
              className={`tf-pipeline-item ${i === active ? "tf-pipeline-active" : ""} ${
                i < active ? "tf-pipeline-done" : ""
              }`}
            >
              <div className="tf-pipeline-text">
                <span className="tf-pipeline-name">{s.label}</span>
                <span className="tf-pipeline-detail">{s.detail}</span>
              </div>
              <span className="tf-pipeline-ms">{s.ms}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
 
/* ----------------------------------------------------------------------- */
/* SDK example — typed terminal                                             */
/* ----------------------------------------------------------------------- */
 
const CODE_LINES = [
  { t: "method", c: ": \"GET\"" },
  { t: "route", c: ": \"/api/orders\"" },
  { t: "status", c: ": 200" },
  { t: "duration", c: ": 124" },
  { t: "trace", c: ": \"req_8f2a19c\"" },
  { blank: true },
  { comment: "// inspect the request with its captured context" },
];
 
function SdkExample() {
  const [linesShown, setLinesShown] = useState(0);
  const [ref, visible] = useReveal(0.3);
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      setLinesShown((n) => (n < CODE_LINES.length ? n + 1 : n));
    }, 160);
    return () => clearInterval(id);
  }, [visible]);
 
  return (
    <section className="tf-section" ref={ref}>
      <div className="tf-sdk-grid">
        <Reveal className="tf-sdk-copy">
          <span className="tf-eyebrow">request workflow</span>
          <h2 className="tf-h2">Send the request. Keep the context.</h2>
          <p className="tf-section-sub">
            TraceFlow starts with the request itself. Make an API call, capture its
            trace, and inspect useful request information without losing the
            context of what you just sent.
          </p>
          <ul className="tf-sdk-list">
            <li>
              <Check size={15} /> Request and trace in one workflow
            </li>
            <li>
              <Check size={15} /> Method, route, status, and duration at a glance
            </li>
            <li>
              <Check size={15} /> Project-level trace history
            </li>
          </ul>
        </Reveal>
        <Reveal delay={120} className="tf-terminal">
          <div className="tf-terminal-bar">
            <span className="tf-dot" style={{ background: "#ff5f57" }} />
            <span className="tf-dot" style={{ background: "#febc2e" }} />
            <span className="tf-dot" style={{ background: "#28c840" }} />
            <span className="tf-terminal-title">orders.service.ts</span>
          </div>
          <pre className="tf-terminal-body">
            {CODE_LINES.slice(0, linesShown).map((line, i) => {
              if (line.blank) return <div key={i}>&nbsp;</div>;
              if (line.comment)
                return (
                  <div key={i} className="tf-code-comment">
                    {line.comment}
                  </div>
                );
              return (
                <div key={i} style={{ paddingLeft: `${(line.indent || 0) * 20}px` }}>
                  {line.t && <span className="tf-code-kw">{line.t}</span>}
                  <span className="tf-code-plain">{line.c}</span>
                </div>
              );
            })}
            <span className="tf-cursor">▍</span>
          </pre>
        </Reveal>
      </div>
    </section>
  );
}
 
/* ----------------------------------------------------------------------- */
/* Dashboard preview                                                         */
/* ----------------------------------------------------------------------- */
 
const REQ_DATA = Array.from({ length: 24 }, (_, i) => ({
  t: i,
  v: 40 + Math.round(30 * Math.sin(i / 3) + Math.random() * 18),
}));
 
const LAT_DATA = Array.from({ length: 24 }, (_, i) => ({
  t: i,
  p50: 12 + Math.round(4 * Math.sin(i / 4)),
  p95: 48 + Math.round(14 * Math.cos(i / 3)),
  p99: 90 + Math.round(20 * Math.sin(i / 2.2)),
}));
 
const WATERFALL = [
  { name: "gateway", start: 0, len: 66, color: "var(--indigo)" },
  { name: "auth-svc", start: 2, len: 10, color: "var(--cyan)" },
  { name: "orders-svc", start: 12, len: 30, color: "var(--indigo)" },
  { name: "billing-svc", start: 14, len: 20, color: "var(--emerald)" },
  { name: "postgres", start: 34, len: 22, color: "var(--cyan)" },
  { name: "trace-store", start: 58, len: 6, color: "var(--emerald)" },
];
 
function DashboardPreview() {
  return (
    <section className="tf-section">
      <Reveal className="tf-section-head">
        <span className="tf-eyebrow">product</span>
        <h2 className="tf-h2">A dashboard built around one trace, not one metric</h2>
        <p className="tf-section-sub">
          Every panel below is looking at the same request.
        </p>
      </Reveal>
      <Reveal delay={100} className="tf-dash">
        <div className="tf-dash-panel tf-dash-req">
          <div className="tf-dash-panel-head">
            <span>Requests / min</span>
            <span className="tf-dash-badge">1,204</span>
          </div>
          <div className="tf-dash-chart">
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={REQ_DATA}>
                <defs>
                  <linearGradient id="reqFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fill="url(#reqFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
 
        <div className="tf-dash-panel tf-dash-lat">
          <div className="tf-dash-panel-head">
            <span>Latency percentiles</span>
            <span className="tf-dash-badge tf-dash-badge-cyan">p99 108ms</span>
          </div>
          <div className="tf-dash-chart">
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={LAT_DATA}>
                <Line type="monotone" dataKey="p50" stroke="#34d399" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="p95" stroke="#22d3ee" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="p99" stroke="#818cf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
 
        <div className="tf-dash-panel tf-dash-waterfall">
          <div className="tf-dash-panel-head">
            <span>Trace waterfall — req_8f2a19c</span>
            <span className="tf-dash-badge">66ms total</span>
          </div>
          <div className="tf-dash-wf">
            {WATERFALL.map((w) => (
              <div className="tf-dash-wf-row" key={w.name}>
                <span className="tf-dash-wf-label">{w.name}</span>
                <div className="tf-dash-wf-track">
                  <div
                    className="tf-dash-wf-bar"
                    style={{
                      marginLeft: `${(w.start / 66) * 100}%`,
                      width: `${(w.len / 66) * 100}%`,
                      background: w.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
 
        <div className="tf-dash-panel tf-dash-graph">
          <div className="tf-dash-panel-head">
            <span>Service graph</span>
          </div>
          <FeatureGraph />
        </div>
 
        <div className="tf-dash-panel tf-dash-stat">
          <div className="tf-dash-panel-head">
            <span>Error rate</span>
          </div>
          <div className="tf-dash-stat-value" style={{ color: "var(--emerald)" }}>
            2.1%
          </div>
          <div className="tf-dash-stat-sub">example response status</div>
        </div>
 
        <div className="tf-dash-panel tf-dash-stat">
          <div className="tf-dash-panel-head">
            <span>Request duration</span>
          </div>
          <div className="tf-dash-stat-value" style={{ color: "var(--cyan)" }}>
            124ms
          </div>
          <div className="tf-dash-stat-sub">example request duration</div>
        </div>
      </Reveal>
    </section>
  );
}
 
/* ----------------------------------------------------------------------- */
/* Stats                                                                     */
/* ----------------------------------------------------------------------- */
 
const STATS = [
  { display: "API", label: "Request-first workflow" },
  { display: "TRACE", label: "Captured request context" },
  { display: "1", label: "Place to inspect request + trace" },
  { display: "SOON", label: "Pricing" },
];
 
function StatItem({ s }) {
  const [ref, visible] = useReveal(0.5);
  const value = s.value ? useCountUp(s.value, 1500, visible) : 0;
  return (
    <div className="tf-stat" ref={ref}>
      <div className="tf-stat-value">
        {s.display ?? (s.decimals ? value.toFixed(s.decimals) : Math.round(value))}
        {s.suffix ?? ""}
      </div>
      <div className="tf-stat-label">{s.label}</div>
    </div>
  );
}function Stats() {
  return (
    <section className="tf-section tf-stats-section">
      <div className="tf-stats-grid">
        {STATS.map((s) => (
          <StatItem s={s} key={s.label} />
        ))}
      </div>
    </section>
  );
}
 
/* ----------------------------------------------------------------------- */
/* Testimonials                                                             */
/* ----------------------------------------------------------------------- */
 
const TESTIMONIALS = [
  {
    quote: "A request should not disappear the moment you hit send. It should leave enough context to understand what happened.",
    name: "TraceFlow principle",
    role: "Request-first debugging",
  },
  {
    quote: "The goal is simple: give developers more information about the request without making them jump between tools just to investigate it.",
    name: "TraceFlow goal",
    role: "Developer workflow",
  },
  {
    quote: "When something is slow, the useful question is not only whether it is slow. It is where the time is actually going.",
    name: "TraceFlow direction",
    role: "Bottleneck discovery",
  },
];
 
function Testimonials() {
  return (
    <section className="tf-section">
      <Reveal className="tf-section-head">
        <span className="tf-eyebrow">the idea behind TraceFlow</span>
        <h2 className="tf-h2">Built around a simple debugging idea</h2>
      </Reveal>
      <div className="tf-testi-grid">
        {TESTIMONIALS.map((t, i) => (
          <Reveal delay={i * 90} className="tf-testi" key={t.name}>
            <p className="tf-testi-quote">&ldquo;{t.quote}&rdquo;</p>
            <div className="tf-testi-person">
              <div className="tf-testi-avatar">{t.name[0]}</div>
              <div>
                <div className="tf-testi-name">{t.name}</div>
                <div className="tf-testi-role">{t.role}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
 
/* ----------------------------------------------------------------------- */
/* Pricing                                                                   */
/* ----------------------------------------------------------------------- */
 
function Pricing() {
  return (
    <section className="tf-section" id="pricing">
      <Reveal className="tf-section-head">
        <span className="tf-eyebrow">pricing</span>
        <h2 className="tf-h2">Pricing is coming soon</h2>
        <p className="tf-section-sub">
          TraceFlow is still being actively built. We want to understand the
          product, usage patterns, and infrastructure costs before introducing
          pricing.
        </p>
      </Reveal>
      <Reveal className="tf-coming-soon-card">
        <div className="tf-coming-soon-icon"><Sparkles size={20} /></div>
        <div>
          <h3 className="tf-coming-soon-title">Built first. Priced thoughtfully.</h3>
          <p className="tf-coming-soon-copy">
            The current focus is on building a useful tracing experience for
            Express developers, solo developers, and startups. Pricing will be
            announced once the product is ready for its next stage.
          </p>
        </div>
        <span className="tf-coming-soon-badge">COMING SOON</span>
      </Reveal>
    </section>
  );
}

/* FAQ                                                                       */
/* ----------------------------------------------------------------------- */
 
const FAQS = [
  {
    q: "What is TraceFlow?",
    a: "TraceFlow is an API and tracing tool focused on helping backend developers capture requests, inspect their traces, and understand what happened during a request.",
  },
  {
    q: "Who is TraceFlow built for?",
    a: "The current focus is Express and backend developers, including solo developers and startups that want a straightforward way to inspect their API requests and traces.",
  },
  {
    q: "What problem is TraceFlow trying to solve?",
    a: "Instead of only seeing an API response, TraceFlow gives the developer more information about the request so they can track it and investigate where a problem or bottleneck is occurring.",
  },
  {
    q: "Why build another tracing tool?",
    a: "TraceFlow was inspired by working with existing tracing tools such as Jaeger. The goal is to provide a request-focused environment where developers can inspect the trace without losing the context of the request itself.",
  },
];
 
function FaqItem({ item, open, onClick }) {
  return (
    <div className={`tf-faq-item ${open ? "tf-faq-open" : ""}`}>
      <button className="tf-faq-q" onClick={onClick}>
        {item.q}
        <ChevronDown size={16} className="tf-faq-chevron" />
      </button>
      <div className="tf-faq-a-wrap">
        <p className="tf-faq-a">{item.a}</p>
      </div>
    </div>
  );
}
 
function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="tf-section">
      <Reveal className="tf-section-head">
        <span className="tf-eyebrow">faq</span>
        <h2 className="tf-h2">Good to know</h2>
      </Reveal>
      <Reveal delay={80} className="tf-faq-list">
        {FAQS.map((f, i) => (
          <FaqItem
            key={f.q}
            item={f}
            open={open === i}
            onClick={() => setOpen(open === i ? -1 : i)}
          />
        ))}
      </Reveal>
    </section>
  );
}
 
/* ----------------------------------------------------------------------- */
/* Footer                                                                    */
/* ----------------------------------------------------------------------- */
 
function Footer() {
  return (
    <footer className="tf-footer">
      <div className="tf-footer-top">
        <div>
          <Logo />
          <p className="tf-footer-tagline">
            Distributed tracing for backend teams who ship fast and debug faster.
          </p>
        </div>
        <div className="tf-footer-cols">
          <div className="tf-footer-col">
            <span className="tf-footer-heading">Product</span>
            <a href="#"><BookOpen size={13} /> Documentation</a>
            <a href="#"><Boxes size={13} /> API reference</a>
            <a href="#"><Radio size={13} /> Status</a>
          </div>
          <div className="tf-footer-col">
            <span className="tf-footer-heading">Community</span>
            <a href="#"><Github size={13} /> GitHub</a>
            <a href="#"><MessageCircle size={13} /> Discord</a>
          </div>
          <div className="tf-footer-col">
            <span className="tf-footer-heading">Company</span>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>
      <div className="tf-footer-bottom">
        <span>© {new Date().getFullYear()} TraceFlow</span>
        <span className="tf-footer-status">
          <span className="tf-live-dot" /> TraceFlow is actively building
        </span>
      </div>
    </footer>
  );
}
 
/* ----------------------------------------------------------------------- */
/* Root                                                                      */
/* ----------------------------------------------------------------------- */
 
export default function TraceFlowLanding() {
  return (
    <div className="tf-root">
      <Style />
      <NavBar />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <SdkExample />
      <DashboardPreview />
      <Stats />
      <Testimonials />
      <Pricing />
      <Faq />
      <Footer />
    </div>
  );
}
 
/* ----------------------------------------------------------------------- */
/* Styles                                                                    */
/* ----------------------------------------------------------------------- */
 
function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
 
      .tf-root {
        --bg: #030712;
        --card: rgba(255,255,255,0.04);
        --card-hover: rgba(255,255,255,0.07);
        --border: rgba(255,255,255,0.08);
        --indigo: #6366f1;
        --indigo-soft: #818cf8;
        --cyan: #22d3ee;
        --emerald: #34d399;
        --text: #f8fafc;
        --muted: #94a3b8;
        --mono: 'JetBrains Mono', ui-monospace, monospace;
        --sans: 'Inter', -apple-system, sans-serif;
        --display: 'Space Grotesk', 'Inter', sans-serif;
 
        background: var(--bg);
        color: var(--text);
        font-family: var(--sans);
        position: relative;
        overflow-x: hidden;
        min-height: 100vh;
      }
      .tf-root * { box-sizing: border-box; }
      .tf-root a { color: inherit; text-decoration: none; }
      .tf-root button { font-family: var(--sans); cursor: pointer; border: none; }
 
      /* ---------- reveal ---------- */
      .reveal { opacity: 0; transform: translateY(18px); transition: opacity 0.7s ease, transform 0.7s ease; }
      .reveal-in { opacity: 1; transform: translateY(0); }
      @media (prefers-reduced-motion: reduce) {
        .reveal { opacity: 1; transform: none; transition: none; }
      }
 
      /* ---------- nav ---------- */
      .tf-nav { position: sticky; top: 0; z-index: 50; padding: 18px 0; transition: all 0.35s ease; }
      .tf-nav-scrolled { background: rgba(3,7,18,0.72); backdrop-filter: blur(14px); border-bottom: 1px solid var(--border); padding: 12px 0; }
      .tf-nav-inner { max-width: 1180px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 32px; }
      .tf-logo { display: flex; align-items: center; gap: 8px; font-family: var(--display); font-weight: 600; font-size: 16px; letter-spacing: -0.01em; }
      .tf-logo-word { }
      .tf-nav-links { display: flex; gap: 26px; margin-right: auto; }
      .tf-nav-link { font-size: 13.5px; color: var(--muted); transition: color 0.2s; }
      .tf-nav-link:hover { color: var(--text); }
      .tf-nav-actions { display: flex; align-items: center; gap: 10px; }
      .tf-nav-login { padding: 8px 4px; }
      .tf-nav-burger { display: none; flex-direction: column; gap: 4px; background: none; padding: 6px; margin-left: auto; }
      .tf-nav-burger span { width: 20px; height: 1.5px; background: var(--text); border-radius: 2px; }
      .tf-nav-mobile { display: flex; flex-direction: column; gap: 14px; padding: 18px 24px; border-top: 1px solid var(--border); }
 
      .tf-btn { display: inline-flex; align-items: center; gap: 7px; font-size: 13.5px; font-weight: 500; padding: 9px 16px; border-radius: 8px; transition: all 0.2s ease; white-space: nowrap; }
      .tf-btn-solid { background: var(--text); color: #05070d; }
      .tf-btn-solid:hover { transform: translateY(-1px); box-shadow: 0 8px 24px -8px rgba(129,140,248,0.5); }
      .tf-btn-ghost { background: var(--card); border: 1px solid var(--border); color: var(--text); }
      .tf-btn-ghost:hover { background: var(--card-hover); }
      .tf-btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); font-family: var(--mono); }
      .tf-btn-outline:hover { border-color: rgba(129,140,248,0.5); background: rgba(99,102,241,0.06); }
      .tf-btn-lg { padding: 12px 20px; font-size: 14px; }
 
      /* ---------- hero ---------- */
      .tf-hero { position: relative; padding: 100px 24px 40px; text-align: center; overflow: hidden; }
      .tf-grid-bg {
        position: absolute; inset: 0;
        background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
        background-size: 44px 44px;
        mask-image: radial-gradient(ellipse 65% 55% at 50% 15%, black 40%, transparent 90%);
        pointer-events: none;
      }
      .tf-noise {
        position: absolute; inset: 0; opacity: 0.035; pointer-events: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      }
      .tf-glow { position: absolute; border-radius: 999px; filter: blur(90px); pointer-events: none; }
      .tf-glow-a { width: 480px; height: 340px; top: -140px; left: 8%; background: radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%); }
      .tf-glow-b { width: 420px; height: 320px; top: -80px; right: 5%; background: radial-gradient(circle, rgba(34,211,238,0.22), transparent 70%); }
 
      .tf-hero-inner { position: relative; max-width: 880px; margin: 0 auto; }
      .tf-eyebrow { display: inline-flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 12px; color: var(--indigo-soft); background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.25); padding: 6px 12px; border-radius: 999px; margin-bottom: 22px; }
      .tf-h1 { font-family: var(--display); font-size: clamp(2.4rem, 5.4vw, 4rem); line-height: 1.06; letter-spacing: -0.03em; font-weight: 600; margin: 0 0 20px; }
      .tf-h1-accent { background: linear-gradient(90deg, var(--indigo-soft), var(--cyan)); -webkit-background-clip: text; background-clip: text; color: transparent; }
      .tf-hero-sub { font-size: 17px; color: var(--muted); max-width: 560px; margin: 0 auto 34px; line-height: 1.6; }
      .tf-hero-ctas { display: flex; gap: 12px; justify-content: center; margin-bottom: 64px; flex-wrap: wrap; }
 
      .tf-hero-visual { max-width: 760px; margin: 0 auto; }
      .tf-hero-graph { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 20px 20px 14px; backdrop-filter: blur(10px); }
      .tf-hero-svg { width: 100%; height: auto; }
      .tf-edge { stroke: rgba(255,255,255,0.14); stroke-width: 1.4; transition: stroke 0.3s; }
      .tf-edge-active { stroke: var(--indigo-soft); stroke-width: 1.8; }
      .tf-pulse-dot { fill: var(--cyan); filter: drop-shadow(0 0 6px var(--cyan)); }
      .tf-node-ring { fill: rgba(99,102,241,0.08); stroke: rgba(129,140,248,0.35); stroke-width: 1; }
      .tf-node-core { fill: var(--indigo-soft); }
      .tf-node-label { fill: var(--muted); font-size: 9.5px; font-family: var(--mono); }
      .tf-node-ms { fill: var(--emerald); font-size: 9px; font-family: var(--mono); }
      .tf-hero-graph-footer { display: flex; align-items: center; gap: 8px; font-family: var(--mono); font-size: 11.5px; color: var(--muted); margin-top: 6px; }
      .tf-live-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--emerald); box-shadow: 0 0 8px var(--emerald); animation: tf-blink 1.6s ease-in-out infinite; }
      @keyframes tf-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
 
      /* ---------- trusted by ---------- */
      .tf-trusted { padding: 50px 24px; text-align: center; }
      .tf-trusted-label { font-size: 12.5px; color: var(--muted); letter-spacing: 0.02em; margin-bottom: 26px; }
      .tf-marquee { overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, black 12%, black 88%, transparent); mask-image: linear-gradient(90deg, transparent, black 12%, black 88%, transparent); }
      .tf-marquee-track { display: flex; gap: 56px; width: max-content; animation: tf-scroll 26s linear infinite; }
      .tf-marquee-item { font-family: var(--display); font-weight: 600; font-size: 18px; color: rgba(255,255,255,0.28); white-space: nowrap; }
      @keyframes tf-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
 
      /* ---------- sections generic ---------- */
      .tf-section { max-width: 1180px; margin: 0 auto; padding: 90px 24px; }
      .tf-section-head { max-width: 620px; margin: 0 auto 48px; text-align: center; }
      .tf-h2 { font-family: var(--display); font-size: clamp(1.7rem, 3.2vw, 2.3rem); letter-spacing: -0.02em; font-weight: 600; margin: 12px 0 12px; }
      .tf-section-sub { color: var(--muted); font-size: 15px; line-height: 1.6; }
 
      /* ---------- features bento ---------- */
      .tf-feat-grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: minmax(190px, auto); gap: 16px; }
      .tf-feat-wide { grid-column: span 2; }
      .tf-feat-tall { grid-row: span 2; }
      .tf-feat-normal { grid-column: span 2; }
      .tf-feat { border-radius: 16px; }
      .tf-feat-inner { height: 100%; background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 26px; display: flex; flex-direction: column; transition: all 0.3s ease; position: relative; overflow: hidden; }
      .tf-feat-inner:hover { background: var(--card-hover); border-color: rgba(129,140,248,0.3); transform: translateY(-3px); }
      .tf-feat-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
      .tf-feat-icon { width: 38px; height: 38px; border-radius: 10px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; }
      .tf-feat-arrow { color: var(--muted); opacity: 0; transform: translate(-4px,4px); transition: all 0.25s; }
      .tf-feat-inner:hover .tf-feat-arrow { opacity: 1; transform: translate(0,0); }
      .tf-feat-title { font-family: var(--display); font-size: 17px; font-weight: 600; margin: 0 0 8px; }
      .tf-feat-desc { color: var(--muted); font-size: 13.5px; line-height: 1.55; margin: 0; }
      .tf-feat-visual { margin-top: auto; padding-top: 18px; }
      .tf-spark { width: 100%; height: 34px; opacity: 0.9; }
      .tf-mini-waterfall { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
      .tf-mini-wf-row { height: 6px; }
      .tf-mini-wf-bar { height: 100%; border-radius: 4px; opacity: 0.85; }
      .tf-mini-graph { width: 100%; height: 70px; }
 
      /* ---------- pipeline ---------- */
      .tf-pipeline { display: flex; gap: 28px; max-width: 620px; margin: 0 auto; }
      .tf-pipeline-track { position: relative; width: 2px; background: rgba(255,255,255,0.08); border-radius: 2px; margin-top: 6px; }
      .tf-pipeline-progress { position: absolute; top: 0; left: 0; width: 100%; background: linear-gradient(var(--indigo-soft), var(--cyan)); border-radius: 2px; transition: height 0.5s ease; }
      .tf-pipeline-dot { position: absolute; left: 50%; width: 11px; height: 11px; border-radius: 999px; background: var(--cyan); box-shadow: 0 0 14px var(--cyan); transform: translate(-50%, -50%); transition: top 0.5s ease; }
      .tf-pipeline-list { list-style: none; margin: 0; padding: 0; flex: 1; display: flex; flex-direction: column; gap: 30px; }
      .tf-pipeline-item { display: flex; justify-content: space-between; align-items: center; opacity: 0.4; transition: all 0.4s ease; transform: translateX(0); }
      .tf-pipeline-active { opacity: 1; }
      .tf-pipeline-active .tf-pipeline-name { color: var(--cyan); }
      .tf-pipeline-done { opacity: 0.7; }
      .tf-pipeline-text { display: flex; flex-direction: column; gap: 2px; }
      .tf-pipeline-name { font-family: var(--display); font-weight: 600; font-size: 15.5px; transition: color 0.3s; }
      .tf-pipeline-detail { font-family: var(--mono); font-size: 12px; color: var(--muted); }
      .tf-pipeline-ms { font-family: var(--mono); font-size: 12.5px; color: var(--emerald); }
 
      /* ---------- sdk ---------- */
      .tf-sdk-grid { display: grid; grid-template-columns: 1fr 1.15fr; gap: 48px; align-items: center; }
      .tf-sdk-list { list-style: none; padding: 0; margin: 22px 0 0; display: flex; flex-direction: column; gap: 12px; }
      .tf-sdk-list li { display: flex; align-items: center; gap: 9px; font-size: 14px; color: var(--muted); }
      .tf-sdk-list svg { color: var(--emerald); flex-shrink: 0; }
      .tf-terminal { background: #05070d; border: 1px solid var(--border); border-radius: 14px; overflow: hidden; box-shadow: 0 30px 70px -30px rgba(0,0,0,0.6); }
      .tf-terminal-bar { display: flex; align-items: center; gap: 7px; padding: 12px 16px; border-bottom: 1px solid var(--border); }
      .tf-dot { width: 10px; height: 10px; border-radius: 999px; }
      .tf-terminal-title { margin-left: 10px; font-family: var(--mono); font-size: 12px; color: var(--muted); }
      .tf-terminal-body { margin: 0; padding: 20px 22px; font-family: var(--mono); font-size: 13px; line-height: 1.75; min-height: 300px; }
      .tf-code-kw { color: var(--cyan); }
      .tf-code-plain { color: #cbd5e1; }
      .tf-code-comment { color: var(--muted); }
      .tf-cursor { color: var(--indigo-soft); animation: tf-blink 1s step-end infinite; }
 
      /* ---------- dashboard ---------- */
      .tf-dash { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
      .tf-dash-panel { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 18px 20px; }
      .tf-dash-req { grid-column: span 2; }
      .tf-dash-lat { grid-column: span 2; }
      .tf-dash-waterfall { grid-column: span 3; }
      .tf-dash-graph { grid-column: span 1; display: flex; flex-direction: column; }
      .tf-dash-stat { grid-column: span 2; }
      .tf-dash-panel-head { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--muted); margin-bottom: 10px; }
      .tf-dash-badge { font-family: var(--mono); font-size: 11.5px; color: var(--indigo-soft); background: rgba(99,102,241,0.12); padding: 3px 8px; border-radius: 6px; }
      .tf-dash-badge-cyan { color: var(--cyan); background: rgba(34,211,238,0.12); }
      .tf-dash-wf { display: flex; flex-direction: column; gap: 10px; }
      .tf-dash-wf-row { display: grid; grid-template-columns: 90px 1fr; align-items: center; gap: 10px; }
      .tf-dash-wf-label { font-family: var(--mono); font-size: 11px; color: var(--muted); }
      .tf-dash-wf-track { height: 9px; background: rgba(255,255,255,0.04); border-radius: 5px; position: relative; }
      .tf-dash-wf-bar { position: absolute; top: 0; height: 100%; border-radius: 5px; }
      .tf-dash-stat-value { font-family: var(--display); font-size: 28px; font-weight: 600; }
      .tf-dash-stat-sub { font-size: 12px; color: var(--muted); margin-top: 4px; }
 
      /* ---------- stats ---------- */
      .tf-stats-section { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
      .tf-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: center; }
      .tf-stat-value { font-family: var(--display); font-size: clamp(1.8rem, 3.4vw, 2.5rem); font-weight: 600; background: linear-gradient(90deg, var(--indigo-soft), var(--cyan)); -webkit-background-clip: text; background-clip: text; color: transparent; }
      .tf-stat-label { color: var(--muted); font-size: 13px; margin-top: 6px; }
 
      /* ---------- testimonials ---------- */
      .tf-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
      .tf-testi { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 26px; transition: all 0.3s; }
      .tf-testi:hover { transform: translateY(-4px); border-color: rgba(129,140,248,0.3); }
      .tf-testi-quote { font-size: 14.5px; line-height: 1.6; color: #e2e8f0; margin: 0 0 20px; }
      .tf-testi-person { display: flex; align-items: center; gap: 10px; }
      .tf-testi-avatar { width: 34px; height: 34px; border-radius: 999px; background: linear-gradient(135deg, var(--indigo), var(--cyan)); display: flex; align-items: center; justify-content: center; font-family: var(--display); font-weight: 600; font-size: 13px; }
      .tf-testi-name { font-size: 13.5px; font-weight: 600; }
      .tf-testi-role { font-size: 12px; color: var(--muted); }
 
      /* ---------- pricing ---------- */
      .tf-pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; align-items: stretch; }
      .tf-plan { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 30px 26px; display: flex; flex-direction: column; position: relative; transition: all 0.3s; }
      .tf-plan:hover { transform: translateY(-4px); }
      .tf-plan-highlight { border-color: rgba(129,140,248,0.5); background: linear-gradient(180deg, rgba(99,102,241,0.09), rgba(99,102,241,0.02)); }
      .tf-plan-tag { position: absolute; top: -12px; right: 24px; font-family: var(--mono); font-size: 11px; background: var(--indigo-soft); color: #05070d; padding: 4px 10px; border-radius: 999px; font-weight: 600; }
      .tf-plan-name { font-family: var(--display); font-size: 15px; color: var(--muted); margin-bottom: 12px; }
      .tf-plan-price { font-family: var(--display); font-size: 34px; font-weight: 600; }
      .tf-plan-period { font-size: 14px; color: var(--muted); font-weight: 400; }
      .tf-plan-desc { font-size: 13.5px; color: var(--muted); margin: 10px 0 20px; min-height: 40px; }
      .tf-plan-features { list-style: none; padding: 0; margin: 0 0 26px; display: flex; flex-direction: column; gap: 11px; flex: 1; }
      .tf-plan-features li { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: #cbd5e1; }
      .tf-plan-features svg { color: var(--emerald); flex-shrink: 0; }
 
            /* ---------- pricing coming soon ---------- */
      .tf-coming-soon-card {
        max-width: 820px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 28px;
        border: 1px solid var(--border);
        border-radius: 18px;
        background: linear-gradient(135deg, rgba(99,102,241,0.09), rgba(34,211,238,0.04));
        position: relative;
        overflow: hidden;
      }
      .tf-coming-soon-icon {
        width: 46px; height: 46px; flex-shrink: 0; border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        color: var(--cyan); background: rgba(34,211,238,0.09);
        border: 1px solid rgba(34,211,238,0.18);
      }
      .tf-coming-soon-title { margin: 0 0 6px; font-family: var(--display); font-size: 17px; font-weight: 600; }
      .tf-coming-soon-copy { margin: 0; max-width: 610px; color: var(--muted); font-size: 13.5px; line-height: 1.6; }
      .tf-coming-soon-badge {
        margin-left: auto; flex-shrink: 0; font-family: var(--mono); font-size: 10px;
        letter-spacing: 0.05em; color: var(--indigo-soft); background: rgba(99,102,241,0.1);
        border: 1px solid rgba(99,102,241,0.22); padding: 6px 9px; border-radius: 999px;
      }

/* ---------- faq ---------- */
      .tf-faq-list { max-width: 680px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px; }
      .tf-faq-item { border: 1px solid var(--border); border-radius: 12px; background: var(--card); overflow: hidden; }
      .tf-faq-q { width: 100%; text-align: left; background: none; padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; color: var(--text); font-size: 14.5px; font-weight: 500; }
      .tf-faq-chevron { transition: transform 0.3s; color: var(--muted); flex-shrink: 0; }
      .tf-faq-open .tf-faq-chevron { transform: rotate(180deg); color: var(--indigo-soft); }
      .tf-faq-a-wrap { max-height: 0; overflow: hidden; transition: max-height 0.35s ease; }
      .tf-faq-open .tf-faq-a-wrap { max-height: 200px; }
      .tf-faq-a { padding: 0 20px 18px; color: var(--muted); font-size: 13.5px; line-height: 1.6; margin: 0; }
 
      /* ---------- footer ---------- */
      .tf-footer { border-top: 1px solid var(--border); padding: 60px 24px 26px; max-width: 1180px; margin: 0 auto; }
      .tf-footer-top { display: flex; justify-content: space-between; gap: 40px; margin-bottom: 46px; flex-wrap: wrap; }
      .tf-footer-tagline { color: var(--muted); font-size: 13.5px; max-width: 260px; margin-top: 14px; line-height: 1.6; }
      .tf-footer-cols { display: flex; gap: 56px; }
      .tf-footer-col { display: flex; flex-direction: column; gap: 12px; }
      .tf-footer-heading { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
      .tf-footer-col a { display: flex; align-items: center; gap: 7px; font-size: 13.5px; color: #cbd5e1; }
      .tf-footer-col a:hover { color: var(--text); }
      .tf-footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 24px; border-top: 1px solid var(--border); font-size: 12.5px; color: var(--muted); }
      .tf-footer-status { display: flex; align-items: center; gap: 6px; }
 
      /* ---------- responsive ---------- */
      @media (max-width: 900px) {
        .tf-feat-grid { grid-template-columns: repeat(2, 1fr); }
        .tf-feat-wide, .tf-feat-normal { grid-column: span 2; }
        .tf-feat-tall { grid-row: span 1; }
        .tf-sdk-grid { grid-template-columns: 1fr; }
        .tf-dash { grid-template-columns: repeat(2, 1fr); }
        .tf-dash-req, .tf-dash-lat, .tf-dash-waterfall, .tf-dash-stat { grid-column: span 2; }
        .tf-dash-graph { grid-column: span 1; }
        .tf-testi-grid, .tf-pricing-grid { grid-template-columns: 1fr; }
        .tf-stats-grid { grid-template-columns: repeat(2, 1fr); row-gap: 30px; }
        .tf-nav-links, .tf-nav-actions { display: none; }
        .tf-nav-burger { display: flex; }
      }
      @media (max-width: 560px) {
        .tf-feat-grid { grid-template-columns: 1fr; }
        .tf-feat-wide, .tf-feat-normal, .tf-feat-tall { grid-column: span 1; grid-row: span 1; }
        .tf-dash { grid-template-columns: 1fr; }
        .tf-dash-req, .tf-dash-lat, .tf-dash-waterfall, .tf-dash-graph, .tf-dash-stat { grid-column: span 1; }
        .tf-pipeline { flex-direction: column; gap: 0; }
        .tf-pipeline-track { display: none; }
        .tf-footer-top { flex-direction: column; }
        .tf-footer-cols { gap: 32px; }
      }
    `}</style>
  );
}