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
      <circle cx="20" cy="45" r="7" className="tf-node-core" />
      <circle cx="80" cy="20" r="7" className="tf-node-core" />
      <circle cx="80" cy="70" r="7" className="tf-node-core" />
      <circle cx="140" cy="45" r="7" className="tf-node-core" />
    </svg>
  );
}
 
function FeatureChart() {
  const data = [
    { t: "10:01", p50: 32, p95: 71 },
    { t: "10:02", p50: 36, p95: 78 },
    { t: "10:03", p50: 31, p95: 69 },
    { t: "10:04", p50: 39, p95: 84 },
    { t: "10:05", p50: 44, p95: 91 },
    { t: "10:06", p50: 37, p95: 76 },
    { t: "10:07", p50: 41, p95: 82 },
    { t: "10:08", p50: 35, p95: 73 },
  ];
  return (
    <div className="tf-feature-chart">
      <ResponsiveContainer width="100%" height={170}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="p95fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="t" hide />
          <YAxis hide />
          <Tooltip />
          <Area type="monotone" dataKey="p95" stroke="var(--cyan)" fill="url(#p95fill)" />
          <Line type="monotone" dataKey="p50" stroke="var(--emerald)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
 
function Features() {
  return (
    <section className="tf-section tf-features">
      <div className="tf-section-inner">
        <Reveal className="tf-section-kicker">WHY TRACEFLOW</Reveal>
        <Reveal delay={80}>
          <h2 className="tf-h2">One request. Every hop.</h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="tf-section-sub">The full story of every request, without digging through logs.</p>
        </Reveal>
        <div className="tf-feature-grid">
          <Reveal className="tf-feature-card tf-feature-wide">
            <div className="tf-feature-copy">
              <span className="tf-feature-icon"><Activity size={18} /></span>
              <h3>End-to-end traces</h3>
              <p>Follow a request from edge to database with a single trace ID. No correlation gymnastics.</p>
            </div>
            <FeatureWaterfall />
          </Reveal>
          <Reveal delay={80} className="tf-feature-card">
            <span className="tf-feature-icon"><GitBranch size={18} /></span>
            <h3>Service topology</h3>
            <p>See exactly how your services depend on each other.</p>
            <FeatureGraph />
          </Reveal>
          <Reveal delay={160} className="tf-feature-card">
            <span className="tf-feature-icon"><Zap size={18} /></span>
            <h3>Latency intelligence</h3>
            <p>Spot p95 and p99 regressions before your users do.</p>
            <FeatureChart />
          </Reveal>
          <Reveal delay={240} className="tf-feature-card tf-feature-wide">
            <span className="tf-feature-icon"><Bug size={18} /></span>
            <h3>Errors with context</h3>
            <p>Every error carries its full trace context, so you can jump straight to the failing span.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
 
/* ----------------------------------------------------------------------- */
/* How it works                                                              */
/* ----------------------------------------------------------------------- */
 
function HowItWorks() {
  const steps = [
    { n: "01", icon: <TerminalIcon size={20} />, title: "Install the SDK", body: "One command. Node, Python, Go, Java and more." },
    { n: "02", icon: <Radio size={20} />, title: "Send your traces", body: "Traces stream to TraceFlow over OTLP with near-zero overhead." },
    { n: "03", icon: <BarChart3 size={20} />, title: "Find the bottleneck", body: "Search, filter and inspect every span in one fast interface." },
  ];
  return (
    <section className="tf-section tf-how">
      <div className="tf-section-inner">
        <Reveal className="tf-section-kicker">HOW IT WORKS</Reveal>
        <Reveal delay={80}>
          <h2 className="tf-h2">From code to clarity.</h2>
        </Reveal>
        <div className="tf-steps">
          {steps.map((s, i) => (
            <React.Fragment key={s.n}>
              <Reveal delay={120 + i * 80} className="tf-step">
                <span className="tf-step-num">{s.n}</span>
                <span className="tf-feature-icon">{s.icon}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </Reveal>
              {i < steps.length - 1 && <div className="tf-step-arrow"><ArrowRight size={16} /></div>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
 
/* ----------------------------------------------------------------------- */
/* Metrics                                                                   */
/* ----------------------------------------------------------------------- */
 
function Metric({ value, suffix, label, delay = 0 }) {
  const [ref, visible] = useReveal(0.4);
  const n = useCountUp(value, 1500, visible);
  return (
    <Reveal delay={delay} className="tf-metric" ref={ref}>
      <div className="tf-metric-value">{Math.round(n)}{suffix}</div>
      <div className="tf-metric-label">{label}</div>
    </Reveal>
  );
}
 
function Metrics() {
  return (
    <section className="tf-metrics">
      <div className="tf-metrics-inner">
        <Metric value={50} suffix="M+" label="requests traced / day" />
        <Metric value={99.99} suffix="%" label="ingestion availability" delay={80} />
        <Metric value={2} suffix="ms" label="median SDK overhead" delay={160} />
        <Metric value={4} suffix="×" label="faster incident resolution" delay={240} />
      </div>
    </section>
  );
}
 
/* ----------------------------------------------------------------------- */
/* Testimonial                                                               */
/* ----------------------------------------------------------------------- */
 
function Testimonial() {
  return (
    <section className="tf-section tf-testimonial">
      <div className="tf-section-inner">
        <Reveal className="tf-quote-mark">“</Reveal>
        <Reveal delay={80}>
          <blockquote>
            We went from spending half an hour correlating logs to finding the
            exact slow query in under a minute. TraceFlow is now the first tab
            open during every incident.
          </blockquote>
        </Reveal>
        <Reveal delay={160} className="tf-quote-by">
          <span className="tf-avatar">MC</span>
          <span><strong>Maya Chen</strong><br /><small>Staff Engineer, Nimbus</small></span>
        </Reveal>
      </div>
    </section>
  );
}
 
/* ----------------------------------------------------------------------- */
/* CTA                                                                       */
/* ----------------------------------------------------------------------- */
 
function FinalCTA() {
  return (
    <section className="tf-final-cta">
      <div className="tf-glow tf-glow-c" />
      <Reveal>
        <h2 className="tf-h2">Your next incident<br /><span className="tf-h2-accent">shouldn't be a mystery.</span></h2>
      </Reveal>
      <Reveal delay={100}>
        <p>Start tracing in minutes. Free for teams up to 100k spans/month.</p>
      </Reveal>
      <Reveal delay={180} className="tf-final-actions">
        <button className="tf-btn tf-btn-solid tf-btn-lg">Start tracing free <ArrowRight size={16} /></button>
        <button className="tf-btn tf-btn-outline tf-btn-lg"><BookOpen size={15} /> Read the docs</button>
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
      <div className="tf-footer-inner">
        <div className="tf-footer-brand">
          <Logo size={20} />
          <p>Distributed tracing for backend teams.</p>
        </div>
        <div className="tf-footer-links">
          <div><span>Product</span><a href="#">Features</a><a href="#">Pricing</a><a href="#">Changelog</a></div>
          <div><span>Developers</span><a href="#">Documentation</a><a href="#">SDKs</a><a href="#">API</a></div>
          <div><span>Company</span><a href="#">About</a><a href="#">Blog</a><a href="#">Contact</a></div>
        </div>
        <div className="tf-footer-bottom">
          <span>© 2025 TraceFlow. Built for engineers.</span>
          <span className="tf-footer-socials"><Github size={15} /><MessageCircle size={15} /></span>
        </div>
      </div>
    </footer>
  );
}
 
/* ----------------------------------------------------------------------- */
/* Page                                                                      */
/* ----------------------------------------------------------------------- */
 
export default function LandingPage() {
  return (
    <main className="tf-page">
      <NavBar />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <Metrics />
      <Testimonial />
      <FinalCTA />
      <Footer />
    </main>
  );
}
