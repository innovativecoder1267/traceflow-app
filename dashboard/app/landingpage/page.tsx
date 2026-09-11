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
  const linked=[{
    name:"product",
    path:"#"
  },{
    name:"Pricing",
    path:"#"
  },{
    name:"Docs",
    path:"../traceflow-docs"
  }]
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
          {links.map((l) => (
            <a key={l} href="#">
              {l}
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
          <Sparkles size={13} /> now tracing 50M+ requests a day
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
            TraceFlow is distributed tracing built for backend teams — follow a
            request across every service, span, and query, and know exactly
            where your latency lives.
          </p>
        </Reveal>
        <Reveal delay={240} className="tf-hero-ctas">
          <button className="tf-btn tf-btn-solid tf-btn-lg">
            Start tracing free <ArrowRight size={16} />
          </button>
          <button className="tf-btn tf-btn-outline tf-btn-lg">
            <TerminalIcon size={15} /> npx traceflow init
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
    "NIMBUS", "Fractal", "Ledgerly", "Hopper", "Quandra", "Northbeam",
    "Cascade", "Vantage", "Orbital", "Rivet",
  ];
  const row = [...names, ...names];
  return (
    <section className="tf-trusted">
      <Reveal className="tf-trusted-label">
        Trusted by engineering teams shipping at scale
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
    title: "Distributed tracing",
    desc: "Follow a single request across every service boundary, queue, and database call — no more guessing where time went.",
    span: "wide",
    color: "var(--indigo)",
    visual: <FeatureGraph />,
  },
  {
    icon: Activity,
    title: "Request monitoring",
    desc: "Live throughput, error rate, and latency for every route, refreshed in real time.",
    span: "tall",
    color: "var(--cyan)",
    visual: <SparkLine color="#22d3ee" />,
  },
  {
    icon: BarChart3,
    title: "Performance analytics",
    desc: "P50 to p99 percentiles, grouped by service, region, or deploy — spot regressions before your users do.",
    span: "normal",
    color: "var(--emerald)",
    visual: <SparkLine color="#34d399" />,
  },
  {
    icon: Layers,
    title: "Custom spans",
    desc: "Wrap any function, job, or query with one line and see it appear in the trace tree instantly.",
    span: "normal",
    color: "var(--indigo)",
    visual: <FeatureWaterfall />,
  },
  {
    icon: Bug,
    title: "Error insights",
    desc: "Every exception linked back to the exact trace, span, and payload that caused it.",
    span: "tall",
    color: "var(--cyan)",
    visual: null,
  },
  {
    icon: Users,
    title: "Team collaboration",
    desc: "Share a trace like a link. Annotate spans, tag teammates, resolve incidents together.",
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
  { label: "Client", detail: "browser / mobile / cli", ms: 0 },
  { label: "API Gateway", detail: "routing + rate limits", ms: 4 },
  { label: "Authentication", detail: "token verification", ms: 9 },
  { label: "Business Logic", detail: "orders-svc handler", ms: 26 },
  { label: "Database", detail: "postgres query", ms: 54 },
  { label: "Trace Storage", detail: "span ingest", ms: 61 },
  { label: "Dashboard", detail: "rendered + alertable", ms: 66 },
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
        <h2 className="tf-h2">One request, seven hops, zero blind spots</h2>
        <p className="tf-section-sub">
          Every stage below is a real span TraceFlow captures automatically.
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
              <span className="tf-pipeline-ms">+{s.ms}ms</span>
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
  { t: "import", c: " { TraceFlow } " },
  { t: "from", c: " \"@traceflow/node\";" },
  { blank: true },
  { t: "TraceFlow", c: ".init({ apiKey: process.env.TF_KEY });" },
  { blank: true },
  { comment: "// wrap anything you want visibility into" },
  { t: "export async function", c: " createOrder(input) {" },
  { indent: 1, t: "return", c: " TraceFlow.withSpan(\"orders.create\", async (span) => {" },
  { indent: 2, t: "span", c: ".setAttribute(\"user.id\", input.userId);" },
  { indent: 2, t: "const", c: " order = await db.orders.insert(input);" },
  { indent: 2, t: "return", c: " order;" },
  { indent: 1, c: "});" },
  { t: "}", c: "" },
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
          <span className="tf-eyebrow">sdk</span>
          <h2 className="tf-h2">One import, full instrumentation</h2>
          <p className="tf-section-sub">
            Drop the SDK into any Node, Python, or Go service. Auto-instruments
            your framework, database driver, and queue client — custom spans
            take one line.
          </p>
          <ul className="tf-sdk-list">
            <li>
              <Check size={15} /> Zero-config for Express, Fastify, Django, Gin
            </li>
            <li>
              <Check size={15} /> 5ms average overhead per request
            </li>
            <li>
              <Check size={15} /> Works alongside OpenTelemetry
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
            0.04%
          </div>
          <div className="tf-dash-stat-sub">last 24h, 6 services</div>
        </div>
 
        <div className="tf-dash-panel tf-dash-stat">
          <div className="tf-dash-panel-head">
            <span>Avg overhead</span>
          </div>
          <div className="tf-dash-stat-value" style={{ color: "var(--cyan)" }}>
            4.8ms
          </div>
          <div className="tf-dash-stat-sub">per instrumented request</div>
        </div>
      </Reveal>
    </section>
  );
}
 
/* ----------------------------------------------------------------------- */
/* Stats                                                                     */
/* ----------------------------------------------------------------------- */
 
const STATS = [
  { value: 50, suffix: "M+", label: "Requests traced daily" },
  { value: 99.99, suffix: "%", label: "SDK reliability", decimals: 2 },
  { value: 5, suffix: "ms", label: "Average SDK overhead" },
  { value: 500, suffix: "+", label: "Engineering teams" },
];
 
function StatItem({ s }) {
  const [ref, visible] = useReveal(0.5);
  const value = useCountUp(s.value, 1500, visible);
  return (
    <div className="tf-stat" ref={ref}>
      <div className="tf-stat-value">
        {s.decimals ? value.toFixed(s.decimals) : Math.round(value)}
        {s.suffix}
      </div>
      <div className="tf-stat-label">{s.label}</div>
    </div>
  );
}
 
function Stats() {
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
    quote:
      "We replaced four dashboards with one trace view. Time-to-root-cause on incidents dropped from an hour to under ten minutes.",
    name: "Priya Nathan",
    role: "Staff Engineer, Fractal",
  },
  {
    quote:
      "The SDK auto-instruments our whole Go stack. Custom spans for the weird internal jobs took an afternoon, not a sprint.",
    name: "Marcus Webb",
    role: "Platform Lead, Cascade",
  },
  {
    quote:
      "TraceFlow is the first observability tool our on-call rotation actually opens before Slack.",
    name: "Elena Sato",
    role: "Co-founder, Rivet",
  },
];
 
function Testimonials() {
  return (
    <section className="tf-section">
      <Reveal className="tf-section-head">
        <span className="tf-eyebrow">from the field</span>
        <h2 className="tf-h2">Teams debugging faster, not harder</h2>
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
 
const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    desc: "For side projects finding their first users.",
    features: ["1 service", "3 day trace retention", "Community support"],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$79",
    period: "/mo",
    desc: "For teams running production workloads.",
    features: [
      "Unlimited services",
      "30 day trace retention",
      "Custom spans + alerts",
      "Priority support",
    ],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For orgs with compliance and scale needs.",
    features: ["SSO + audit logs", "1 year retention", "Dedicated ingest", "SLA + support"],
    cta: "Talk to sales",
  },
];
 
function Pricing() {
  return (
    <section className="tf-section">
      <Reveal className="tf-section-head">
        <span className="tf-eyebrow">pricing</span>
        <h2 className="tf-h2">Priced for teams, not per-seat headaches</h2>
      </Reveal>
      <div className="tf-pricing-grid">
        {PLANS.map((p, i) => (
          <Reveal
            delay={i * 90}
            key={p.name}
            className={`tf-plan ${p.highlight ? "tf-plan-highlight" : ""}`}
          >
            {p.highlight && <span className="tf-plan-tag">Most popular</span>}
            <div className="tf-plan-name">{p.name}</div>
            <div className="tf-plan-price">
              {p.price}
              <span className="tf-plan-period">{p.period}</span>
            </div>
            <p className="tf-plan-desc">{p.desc}</p>
            <ul className="tf-plan-features">
              {p.features.map((f) => (
                <li key={f}>
                  <Check size={14} /> {f}
                </li>
              ))}
            </ul>
            <button
              className={`tf-btn ${p.highlight ? "tf-btn-solid" : "tf-btn-outline"}`}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {p.cta}
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
 
/* ----------------------------------------------------------------------- */
/* FAQ                                                                       */
/* ----------------------------------------------------------------------- */
 
const FAQS = [
  {
    q: "How is TraceFlow different from generic APM tools?",
    a: "TraceFlow is built trace-first: every panel, alert, and chart is a view into the same span data, so you never lose context switching between tools.",
  },
  {
    q: "Does it work with OpenTelemetry?",
    a: "Yes. TraceFlow can ingest OTLP directly, or you can use our SDK for automatic framework and driver instrumentation.",
  },
  {
    q: "What's the performance overhead?",
    a: "5ms on average per instrumented request, measured across our production customer base.",
  },
  {
    q: "Can I self-host?",
    a: "Enterprise plans support a dedicated ingest pipeline in your own VPC.",
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
        <span>© {new Date().getFullYear()} TraceFlow, Inc.</span>
        <span className="tf-footer-status">
          <span className="tf-live-dot" /> all systems operational
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