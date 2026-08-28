"use client"

import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Copy,
  Check,
  Info,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Code2,
  LayoutDashboard,
  Terminal,
  Sparkles,
  ChevronRight,
  Boxes,
} from "lucide-react";
/* --------------------------------------------------------------------- */
/* Content model — sidebar, TOC, and scroll-spy all read from this        */
/* --------------------------------------------------------------------- */

const SECTIONS = [
  {
    id: "introduction",
    label: "Introduction",
    group: "Getting Started",
    keywords: ["intro", "overview", "traceflow"],
  },
  {
    id: "installation",
    label: "Installation",
    group: "Getting Started",
    keywords: ["install", "npm", "setup"],
  },
  {
    id: "initialize-sdk",
    label: "Initialize SDK",
    group: "Getting Started",
    keywords: ["sdk", "init", "apikey"],
  },
  {
    id: "automatic-tracing",
    label: "Automatic Tracing",
    group: "Tracing",
    keywords: ["trace", "request", "instrumentation"],
  },
  {
    id: "custom-spans",
    label: "Custom Spans",
    group: "Tracing",
    keywords: ["span", "database", "custom"],
  },
  {
    id: "dashboard",
    label: "Dashboard",
    group: "Product",
    keywords: ["dashboard", "ui", "traces"],
  },
];
 
const GROUPS = [...new Set(SECTIONS.map((s) => s.group))].map((group) => ({
  group,
  items: SECTIONS.filter((s) => s.group === group),
}));
 
/* --------------------------------------------------------------------- */
/* Tiny dependency-free syntax highlighter                                 */
/* --------------------------------------------------------------------- */

const KEYWORDS = [
  "const", "let", "var", "async", "await", "return", "import", "from",
  "export", "default", "new", "true", "false", "null", "this",
];
 
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
 
function highlight(code, lang) {
  return code
    .split("\n")
    .map((line) => highlightLine(line, lang))
    .join("\n");
}
 
function highlightLine(rawLine, lang) {
  const line = escapeHtml(rawLine);
 
  if (lang === "bash") {
    return line.replace(
      /^(\s*)(npm|npx|yarn|pnpm|export|cd)\b/,
      '$1<span class="tok-kw">$2</span>'
    );
  }
 
  if (/^\s*\/\//.test(line)) return `<span class="tok-comment">${line}</span>`;
 
  let result = line.replace(/(["'`])((?:(?!\1).)*)\1/g, (m) => `<span class="tok-str">${m}</span>`);
 
  KEYWORDS.forEach((kw) => {
    const re = new RegExp(`\\b(${kw})\\b(?![^<]*>)`, "g");
    result = result.replace(re, '<span class="tok-kw">$1</span>');
  });
 
  result = result.replace(/([A-Za-z_$][\w$]*)(?=\()/g, (m, p1, offset, str) => {
    if (str.slice(0, offset).match(/<span[^>]*>$/) || str.includes(`>${p1}<`)) return m;
    return `<span class="tok-fn">${p1}</span>`;
  });
 
  return result;
}
 
/* --------------------------------------------------------------------- */
/* Reveal-on-scroll wrapper (Framer-Motion-equivalent via IO + CSS)        */
/* --------------------------------------------------------------------- */
 
function Reveal({ children, className = "", delay = 0, as: Tag = "div" }) {
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
      { threshold: 0.15 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
 
  return (
    <Tag
      ref={ref}
      className={`tfd-reveal ${visible ? "tfd-reveal-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

 
/* --------------------------------------------------------------------- */
/* Copy button                                                              */
/* --------------------------------------------------------------------- */
 
function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
 
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }
 
  return (
    <button onClick={handleCopy} aria-label="Copy code" className="tfd-copy-btn">
      {copied ? <Check size={13} className="tfd-copy-check" /> : <Copy size={13} />}
    </button>
  );
}
 
/* --------------------------------------------------------------------- */
/* Code block                                                               */
/* --------------------------------------------------------------------- */
 
function CodeBlock({ code, lang = "ts", filename }) {
  const trimmed = code.replace(/^\n/, "").replace(/\n$/, "");
  const lines = highlight(trimmed, lang).split("\n");
 
  return (
    <div className="tfd-code">
      <div className="tfd-code-bar">
        <span className="tfd-dot" style={{ background: "#ff5f57" }} />
        <span className="tfd-dot" style={{ background: "#febc2e" }} />
        <span className="tfd-dot" style={{ background: "#28c840" }} />
        <span className="tfd-code-filename">{filename ?? lang}</span>
        <div className="tfd-code-copy">
          <CopyButton value={trimmed} />
        </div>
      </div>
      <pre className="tfd-code-body">
        <code>
          {lines.map((l, i) => (
            <div key={i} className="tfd-code-line">
              <span className="tfd-code-lineno">{i + 1}</span>
              <span dangerouslySetInnerHTML={{ __html: l || "&nbsp;" }} />
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
 
/* --------------------------------------------------------------------- */
/* Callout                                                                  */
/* --------------------------------------------------------------------- */
 
const CALLOUT_STYLES = {
  info: { icon: Info, cls: "tfd-callout-info" },
  warning: { icon: AlertTriangle, cls: "tfd-callout-warning" },
  success: { icon: CheckCircle2, cls: "tfd-callout-success" },
};
 
function Callout({ type = "info", title, children }) {
  const { icon: Icon, cls } = CALLOUT_STYLES[type];
  return (
    <div className={`tfd-callout ${cls}`}>
      <Icon size={16} className="tfd-callout-icon" />
      <div className="tfd-callout-body">
        {title && <p className="tfd-callout-title">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
 
/* --------------------------------------------------------------------- */
/* Badge                                                                    */
/* --------------------------------------------------------------------- */
 
function Badge({ children, variant = "neutral" }) {
  return <span className={`tfd-badge tfd-badge-${variant}`}>{children}</span>;
}
 
/* --------------------------------------------------------------------- */
/* Keyboard key                                                            */
/* --------------------------------------------------------------------- */
 
function Kbd({ children }) {
  return <kbd className="tfd-kbd">{children}</kbd>;
}
 
/* --------------------------------------------------------------------- */
/* Root component                                                          */
/* --------------------------------------------------------------------- */
 
export default function TraceFlowDocs() {
  const [active, setActive] = useState("introduction");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showsuggestions, setShowSuggestions] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
 
    const sections = SECTIONS
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        setShowSuggestions(true);
      }
    };

    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);
 
 const filteredSections =
  searchQuery.trim() === ""
    ? []
    : SECTIONS.filter((section) => {
        const q = searchQuery.toLowerCase();

        return (
          section.label.toLowerCase().includes(q) ||
          section.keywords.some((keyword) =>
            keyword.toLowerCase().includes(q)
          )
        );
      });

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  setSearchQuery("");
  setShowSuggestions(false);
};

const handleSectionNavigation = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
  event.preventDefault();
  scrollToSection(id);
};
  return (
    <div className="tfd-root">
      <Style />
 
      {/* ---------------- top bar ---------------- */}
      <div className="tfd-topbar">
        <div className="tfd-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 12c2 0 2-5 5-5s3 5 5 5 2-5 5-5" stroke="url(#tlg1)" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 12c2 0 2 5 5 5s3-5 5-5 2 5 5 5" stroke="url(#tlg2)" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
            <defs>
              <linearGradient id="tlg1" x1="4" y1="7" x2="19" y2="7">
              <stop stopColor="#818cf8" /><stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
              <linearGradient id="tlg2" x1="4" y1="17" x2="19" y2="17">
                <stop stopColor="#34d399" /><stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>
          TraceFlow
          <span className="tfd-logo-tag">docs</span>
        </div>
 
        <div className="tfd-search-wrapper">
<div className="tfd-search">
 
          <span className="tfd-search-kbd">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
          {showsuggestions && searchQuery.trim() !== "" && (
  <div className="tfd-search-dropdown">
    {filteredSections.length > 0 ? (
      filteredSections.map((section) => (
        <button
          key={section.id}
          className="tfd-search-item"
          onClick={() => scrollToSection(section.id)}
        >
          <div>
            <p>{section.label}</p>
            <span>{section.group}</span>
          </div>

          <ChevronRight size={14} />
        </button>
      ))
    ) : (
      <div className="tfd-search-empty">
        No results found.
      </div>
    )}
  </div>
)}
</div>
</div> 
        <div className="tfd-topbar-actions">
          <Badge variant="sdk">Express SDK</Badge>
        </div>
      </div>

      {/* ---------------- body ---------------- */}
      <div className="tfd-body">
        {/* sidebar */}
        <aside className="tfd-sidebar">
          <nav>
            {GROUPS.map((g) => (
              <div key={g.group} className="tfd-nav-group">
                <p className="tfd-nav-group-label">{g.group}</p>
                <ul>
                  {g.items.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className={`tfd-nav-link ${active === item.id ? "tfd-nav-link-active" : ""}`}
                        onClick={(event) => handleSectionNavigation(event, item.id)}
                      >
                        {active === item.id && <span className="tfd-nav-dot" />}
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
 
        {/* main content */}
        <main className="tfd-main">
          <Reveal as="section" className="tfd-hero-block">
            <div className="tfd-eyebrow">
              <Sparkles size={12} /> documentation
            </div>
            <h1 className="tfd-h1">TraceFlow</h1>
            <p className="tfd-hero-sub">
              Request-level tracing for Express applications. Capture incoming requests
              automatically and use their timing and response data to investigate issues.
            </p>
          </Reveal>
 
          <Reveal as="section" id="introduction" delay={40} className="tfd-section">
            <div className="tfd-section-kicker">
              <BookOpen size={13} /> Introduction
            </div>
            <h2>Introduction</h2>
            <p>
              TraceFlow is an observability SDK for Node and Express applications. Its
              Express middleware automatically creates a trace for each incoming request.
            </p>
            <p>
              A trace records what happened to one request, including its method, path,
              timing, response status, and whether it succeeded. Those traces are sent
              to TraceFlow so you can review request behavior in the dashboard.
            </p>
            <div className="tfd-glass-row">
              <div className="tfd-glass-card">
                <Code2 size={16} className="tfd-glass-icon" />
                <p className="tfd-glass-title">Express middleware</p>
                <p className="tfd-glass-desc">Capture each incoming Express request with one middleware.</p>
              </div>
              <div className="tfd-glass-card">
                <Boxes size={16} className="tfd-glass-icon" style={{ color: "var(--cyan)" }} />
                <p className="tfd-glass-title">Request traces</p>
                <p className="tfd-glass-desc">See method, path, status code, and request duration.</p>
              </div>
              <div className="tfd-glass-card">
                <LayoutDashboard size={16} className="tfd-glass-icon" style={{ color: "var(--emerald)" }} />
                <p className="tfd-glass-title">Dashboard visibility</p>
                <p className="tfd-glass-desc">Review the traces your application sends to TraceFlow.</p>
              </div>
            </div>
          </Reveal>
 
          <Reveal as="section" id="installation" delay={40} className="tfd-section">
            <div className="tfd-section-kicker">
              <Terminal size={13} /> Getting Started
            </div>
            <h2>Installation</h2>
            <p>
              Install the TraceFlow Express/Node SDK in the Express application you want
              to observe.
            </p>
            <CodeBlock lang="bash" filename="terminal" code={`npm install traceflow-express-sdk@latest`} />
            <Callout type="info" title="Express SDK">
              This package provides the TraceFlow initialization function and Express
              middleware used in the next step.
            </Callout>
          </Reveal>
 
          <Reveal as="section" id="initialize-sdk" delay={40} className="tfd-section">
            <div className="tfd-section-kicker">
              <Terminal size={13} /> Getting Started
            </div>
            <h2>Initialize SDK</h2>
            <p>
              Initialize TraceFlow before registering its middleware. <code>TraceFlow.init</code>
              authenticates the project and returns the middleware to register with Express.
            </p>
            <CodeBlock
              lang="ts"
              filename="server.ts"
              code={`import express from "express";
import { TraceFlow } from "traceflow-express-sdk";
 
const app = express();

const traceFlowMiddleware = await TraceFlow.init({
  apiKey: process.env.TRACEFLOW_API_KEY!,
  endpoint: process.env.TRACEFLOW_BACKEND_ENDPOINT!
});

app.use(traceFlowMiddleware);

app.get("/users", (req, res) => {
  res.json({ users: [] });
});`}
            />
            <Callout type="warning" title="Keep your API key server-side">
              The API key identifies and authenticates your project. Keep it in server-side
              environment variables; do not expose it in client-side code or commit it to
              source control.
            </Callout>
          </Reveal>
 
          <Reveal as="section" id="automatic-tracing" delay={40} className="tfd-section">
            <div className="tfd-section-kicker">
              <Boxes size={13} /> Tracing
            </div>
            <h2>Automatic Tracing</h2>
            <p>
              The middleware automatically creates one trace for every incoming Express
              request. A trace represents the whole request: for example, <code>GET /users</code>
              that returns <code>200</code> in <code>10ms</code>.
            </p>
            <p>
              TraceFlow captures request-level details such as the HTTP method, path,
              start and end times, duration, status code, success or failure, middleware
              duration, and a spans array. Error information is included when it is
              available on the trace.
            </p>
            <Callout type="info" title="Why traces matter">
              If <code>GET /orders</code> returns <code>500</code> after <code>842ms</code>,
              the trace gives you one record to inspect for that request. This makes it
              easier to find slow or failing routes, unusual response times, and the
              endpoint behind a problem.
            </Callout>
          </Reveal>
 
          <Reveal as="section" id="custom-spans" delay={40} className="tfd-section">
            <div className="tfd-section-kicker">
              <Boxes size={13} /> Tracing
            </div>
            <h2>Custom Spans</h2>
            <p>
              A trace is the complete request. A span is one piece of work inside that
              request, such as authenticating a user, querying a database, or calculating
              an order total.
            </p>
            <CodeBlock
              lang="text"
              filename="conceptual request breakdown"
              code={`GET /orders — 900ms
├── database query — 760ms
├── business logic — 100ms
└── response — 40ms`}
            />
            <p>
              Traces answer, “The request was slow.” Spans can answer, “Why was it slow?”
              by showing the timing of individual operations.
            </p>
            <Callout type="info" title="Custom spans are coming soon">
              Traces are available today and automatically capture incoming Express
              requests. Custom spans will make it possible to break a request into
              individual operations for a more detailed timing view.
              <ul>
                <li>Custom application spans</li>
                <li>Detailed operation timing</li>
                <li>Nested span visualization</li>
              </ul>
            </Callout>
          </Reveal>
 
          <Reveal as="section" id="dashboard" delay={40} className="tfd-section">
            <div className="tfd-section-kicker">
              <LayoutDashboard size={13} /> Product
            </div>
            <h2>Dashboard</h2>
            <p>
              Once the SDK sends traces, they appear in the TraceFlow dashboard. The trace
              list is useful for quickly scanning incoming requests.
            </p>
            <p>
              Trace entries include useful request information such as the method and
              route, status code, duration, and timestamp. For example: <code>GET /users</code>,
              <code>200 · Success</code>, and <code>10ms</code>. Use the list to identify
              requests that deserve a closer look.
            </p>
          </Reveal>
 
        </main>
 
        {/* on this page */}
     
      </div>
    </div>
  );
}
 
/* --------------------------------------------------------------------- */
/* Styles                                                                   */
/* --------------------------------------------------------------------- */
 
function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
 
      .tfd-root {
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
        min-height: 100vh;
        border-radius: 18px;
        overflow: hidden;
        border: 1px solid var(--border);
      }
      .tfd-root * { box-sizing: border-box; }
      .tfd-root button { font-family: var(--sans); cursor: pointer; border: none; background: none; }
      .tfd-root a { text-decoration: none; color: inherit; }
      .tfd-root code { font-family: var(--mono); }
 
      /* reveal */
      .tfd-reveal { opacity: 0; transform: translateY(14px); transition: opacity 0.6s ease, transform 0.6s ease; }
      .tfd-reveal-in { opacity: 1; transform: translateY(0); }
      @media (prefers-reduced-motion: reduce) { .tfd-reveal { opacity: 1; transform: none; } }
 
      /* topbar */
      .tfd-topbar { display: flex; align-items: center; gap: 20px; padding: 14px 22px; border-bottom: 1px solid var(--border); background: rgba(3,7,18,0.85); backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 30; }
      .tfd-logo { display: flex; align-items: center; gap: 8px; font-family: var(--display); font-weight: 600; font-size: 15px; }
      .tfd-logo-tag { font-family: var(--mono); font-size: 10px; color: var(--muted); background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 2px 6px; border-radius: 5px; }
      .tfd-search { display: flex; align-items: center; gap: 8px; flex: 1; max-width: 360px; margin: 0 auto; background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 7px 12px; transition: all 0.2s; }
      .tfd-search:hover { background: var(--card-hover); border-color: rgba(255,255,255,0.15); }
      .tfd-search-icon { color: var(--muted); }
      .tfd-search-placeholder { flex: 1; text-align: left; font-size: 13px; color: var(--muted); }
      .tfd-search-kbd { display: flex; gap: 3px; }
      .tfd-kbd { display: inline-flex; align-items: center; justify-content: center; height: 18px; min-width: 18px; padding: 0 4px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.06); font-family: var(--mono); font-size: 10.5px; color: #cbd5e1; box-shadow: 0 1px 0 rgba(255,255,255,0.08); }
      .tfd-topbar-actions { display: flex; align-items: center; gap: 10px; }
 
      /* body layout */
      .tfd-body { display: grid; grid-template-columns: 220px minmax(0,1fr) 200px; max-width: 1280px; margin: 0 auto; }
 
      /* sidebar */
      .tfd-sidebar { position: sticky; top: 57px; align-self: start; height: calc(100vh - 57px); overflow-y: auto; padding: 28px 14px; border-right: 1px solid var(--border); }
      .tfd-nav-group { margin-bottom: 26px; }
      .tfd-nav-group-label { font-family: var(--mono); font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.3); padding: 0 10px; margin-bottom: 8px; }
      .tfd-nav-group ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1px; }
      .tfd-nav-link { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 6px; font-size: 13.5px; color: #94a3b8; transition: all 0.18s; }
      .tfd-nav-link:hover { color: var(--text); background: rgba(255,255,255,0.03); }
      .tfd-nav-link-active { color: var(--text); background: rgba(99,102,241,0.12); }
      .tfd-nav-dot { width: 4px; height: 4px; border-radius: 999px; background: var(--indigo-soft); box-shadow: 0 0 6px var(--indigo-soft); }
 
      /* main */
      .tfd-main { min-width: 0; padding: 40px 40px 80px; }
      .tfd-hero-block { margin-bottom: 8px; }
      .tfd-eyebrow { display: inline-flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 11.5px; color: var(--indigo-soft); background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.25); padding: 5px 11px; border-radius: 999px; margin-bottom: 16px; }
      .tfd-h1 { font-family: var(--display); font-size: 2.4rem; font-weight: 600; letter-spacing: -0.03em; margin: 0 0 14px; }
      .tfd-hero-sub { font-size: 15.5px; line-height: 1.7; color: var(--muted); max-width: 560px; margin: 0 0 20px; }
 
      .tfd-section { padding-top: 44px; border-top: 1px solid var(--border); margin-top: 8px; scroll-margin-top: 80px; }
      .tfd-section-last { padding-bottom: 20px; }
      .tfd-section-kicker { display: inline-flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); margin-bottom: 10px; }
      .tfd-section h2 { font-family: var(--display); font-size: 1.55rem; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 14px; }
      .tfd-section p { font-size: 15px; line-height: 1.75; color: #cbd5e1; margin: 0 0 14px; }
      .tfd-section code { background: rgba(255,255,255,0.06); border: 1px solid var(--border); padding: 2px 6px; border-radius: 5px; font-size: 0.85em; color: var(--cyan); }
 
      .tfd-glass-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 20px; }
      .tfd-glass-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; transition: all 0.25s; }
      .tfd-glass-card:hover { background: var(--card-hover); border-color: rgba(129,140,248,0.3); transform: translateY(-2px); }
      .tfd-glass-icon { color: var(--indigo-soft); margin-bottom: 10px; }
      .tfd-glass-title { font-size: 13.5px; font-weight: 600; color: var(--text); margin: 0 0 4px; }
      .tfd-glass-desc { font-size: 12.5px; color: var(--muted); margin: 0; line-height: 1.5; }
 
      .tfd-badge-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
 
      /* code block */
      .tfd-code { margin: 18px 0; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); background: #05070d; box-shadow: 0 20px 50px -28px rgba(0,0,0,0.7); }
      .tfd-code-bar { display: flex; align-items: center; gap: 7px; padding: 10px 14px; border-bottom: 1px solid var(--border); }
      .tfd-dot { width: 9px; height: 9px; border-radius: 999px; }
      .tfd-code-filename { margin-left: 8px; font-family: var(--mono); font-size: 11.5px; color: var(--muted); }
      .tfd-code-copy { margin-left: auto; }
      .tfd-copy-btn { display: inline-flex; align-items: center; justify-content: center; height: 26px; width: 26px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: var(--muted); transition: all 0.2s; }
      .tfd-copy-btn:hover { background: rgba(255,255,255,0.08); color: var(--text); }
      .tfd-copy-check { color: var(--emerald); }
      .tfd-code-body { margin: 0; padding: 14px 18px; overflow-x: auto; font-family: var(--mono); font-size: 12.8px; line-height: 1.7; }
      .tfd-code-line { display: flex; gap: 14px; }
      .tfd-code-lineno { width: 14px; flex-shrink: 0; text-align: right; user-select: none; color: #3f4657; }
      .tok-kw { color: var(--cyan); }
      .tok-str { color: var(--emerald); }
      .tok-comment { color: var(--muted); }
      .tok-fn { color: #f2c078; }
 
      /* callout */
      .tfd-callout { display: flex; gap: 10px; padding: 13px 16px; border-radius: 10px; border: 1px solid; margin: 16px 0; }
      .tfd-callout-icon { flex-shrink: 0; margin-top: 1px; }
      .tfd-callout-title { font-size: 13.5px; font-weight: 600; color: var(--text); margin: 0 0 3px; }
      .tfd-callout-body { font-size: 13px; line-height: 1.6; color: #cbd5e1; }
      .tfd-callout-info { border-color: rgba(129,140,248,0.25); background: rgba(99,102,241,0.07); }
      .tfd-callout-info .tfd-callout-icon { color: var(--indigo-soft); }
      .tfd-callout-warning { border-color: rgba(251,191,36,0.25); background: rgba(251,191,36,0.06); }
      .tfd-callout-warning .tfd-callout-icon { color: #fbbf24; }
      .tfd-callout-success { border-color: rgba(52,211,153,0.25); background: rgba(52,211,153,0.06); }
      .tfd-callout-success .tfd-callout-icon { color: var(--emerald); }
 
      /* badge */
      .tfd-badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 3px 10px; font-family: var(--mono); font-size: 10.5px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.03em; border: 1px solid; }
      .tfd-badge-sdk { color: var(--indigo-soft); background: rgba(99,102,241,0.12); border-color: rgba(129,140,248,0.2); }
      .tfd-badge-new { color: var(--emerald); background: rgba(52,211,153,0.12); border-color: rgba(52,211,153,0.2); }
      .tfd-badge-neutral { color: var(--muted); background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
 
      /* next steps */
      .tfd-next-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 18px; }
      .tfd-next-card { text-align: left; background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 18px; transition: all 0.25s; }
      .tfd-next-card:hover { background: var(--card-hover); border-color: rgba(129,140,248,0.3); transform: translateY(-2px); }
      .tfd-next-card-top { display: flex; justify-content: space-between; align-items: center; color: var(--indigo-soft); margin-bottom: 12px; }
      .tfd-next-arrow { color: var(--muted); transition: transform 0.2s; }
      .tfd-next-card:hover .tfd-next-arrow { transform: translateX(3px); color: var(--text); }
      .tfd-next-title { font-family: var(--display); font-weight: 600; font-size: 14.5px; margin: 0 0 4px; }
      .tfd-next-desc { font-size: 12.5px; color: var(--muted); margin: 0; line-height: 1.5; }
 
      /* toc */
      .tfd-toc { position: sticky; top: 57px; align-self: start; height: calc(100vh - 57px); overflow-y: auto; padding: 28px 18px; }
      .tfd-toc-label { font-family: var(--mono); font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.3); margin-bottom: 12px; }
      .tfd-toc ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; border-left: 1px solid var(--border); }
      .tfd-toc-link { display: block; padding: 2px 0 2px 13px; margin-left: -1px; border-left: 1px solid transparent; font-size: 12.5px; color: #64748b; transition: all 0.2s; }
      .tfd-toc-link:hover { color: #cbd5e1; }
      .tfd-toc-link-active { color: var(--text); border-left-color: var(--indigo-soft); }
 
      @media (max-width: 1080px) {
        .tfd-body { grid-template-columns: 200px minmax(0,1fr); }
        .tfd-toc { display: none; }
      }
      @media (max-width: 900px) {
        .tfd-body { grid-template-columns: 1fr; }
        .tfd-sidebar { position: static; height: auto; padding: 16px 20px; border-right: none; border-bottom: 1px solid var(--border); overflow-x: auto; }
        .tfd-sidebar nav { display: flex; gap: 24px; min-width: max-content; }
        .tfd-nav-group { flex: 0 0 auto; margin-bottom: 0; }
      }
      @media (max-width: 760px) {
        .tfd-glass-row, .tfd-next-grid { grid-template-columns: 1fr; }
        .tfd-search { display: none; }
        .tfd-main { padding: 28px 20px 60px; }
      }
    `}</style>
  );
}
