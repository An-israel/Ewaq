import { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";

// ─── Admin credentials ────────────────────────────────────────────────────────
const ADMIN_USERS = {
  "aniekaneazy@gmail.com":        "LTL@Admin2026",
  "ideallifecitymedia@gmail.com": "ILC@Admin2026",
};

async function saveSubmission(data) {
  const { error } = await supabase.from("submissions").insert({
    name:       data.name,
    email:      data.email,
    avg:        data.avg,
    total:      data.total,
    s_a:        data.sA,
    s_b:        data.sB,
    s_c:        data.sC,
    label:      data.label,
    reflection: data.reflection || null,
  });
  if (error) console.error("Supabase insert error:", error.message);
}

async function fetchSubmissions() {
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("Supabase fetch error:", error.message); return []; }
  return (data || []).map(r => ({
    ...r,
    sA: r.s_a, sB: r.s_b, sC: r.s_c,
  }));
}

// ─── Questions ────────────────────────────────────────────────────────────────
const ALL_QUESTIONS = [
  { id: 1,  section: "A", text: "I rarely feel satisfied or content with my life." },
  { id: 2,  section: "A", text: "I often feel emotionally overwhelmed or unsettled." },
  { id: 3,  section: "A", text: "It takes me a long time to regain emotional balance after difficult experiences." },
  { id: 4,  section: "A", text: "I struggle to trust people without fearing disappointment." },
  { id: 5,  section: "B", text: "Little things get me overwhelmed, upset, or irritated." },
  { id: 6,  section: "B", text: "When I am upset, I sometimes make decisions I later regret." },
  { id: 7,  section: "B", text: "I get anxious and restless when I remember certain events from my past." },
  { id: 8,  section: "B", text: "I replay painful conversations in my mind for a long time." },
  { id: 9,  section: "B", text: "I am often harder on myself than I am on other people." },
  { id: 10, section: "B", text: "When I am emotionally overwhelmed, I prefer to be alone." },
  { id: 11, section: "C", text: "I smile or act normal even when something is hurting me." },
  { id: 12, section: "C", text: "I struggle to ask for emotional support even when I need it." },
  { id: 13, section: "C", text: "I often keep my emotions to myself even when they are bothering me." },
  { id: 14, section: "C", text: "I find it difficult to identify exactly what emotion I am experiencing." },
  { id: 15, section: "C", text: "I struggle to recognize the situations or people that strongly affect my emotions." },
  { id: 16, section: "C", text: "I find it difficult to explain how I feel without becoming aggressive or shutting down." },
];

const SECTION_META = {
  A: { label: "Section A", title: "Emotional Stability",             color: "#14532D", light: "#F0FDF4", step: 1 },
  B: { label: "Section B", title: "Emotional Distress & Reactivity", color: "#1E3A8A", light: "#EFF6FF", step: 2 },
  C: { label: "Section C", title: "Emotional Expression",            color: "#581C87", light: "#F5F3FF", step: 3 },
};

const SCALE = [
  { value: 1, label: "Never" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
  { value: 5, label: "Almost Always" },
];

// ─── Interpretation (keyed on avg 1–5) ───────────────────────────────────────
function getInterpretation(avg) {
  if (avg <= 2) return {
    label: "Thriving",
    tagline: "Your emotional foundation is strong.",
    icon: "🌱",
    color: "#14532D", accent: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", bar: "#22C55E",
    description: "Your responses reflect strong emotional stability, healthy coping patterns, and a well-developed sense of self-awareness. You are navigating life's emotional demands with notable resilience and groundedness.",
    advice: "Keep nurturing these habits consistently. Your emotional strength can be a powerful gift to those around you — consider how you might support others in building what you already have.",
  };
  if (avg <= 3) return {
    label: "Stable",
    tagline: "You're doing well, with room to grow.",
    icon: "🌤",
    color: "#1E3A8A", accent: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", bar: "#3B82F6",
    description: "You're managing your emotional life fairly well overall, but certain areas show signs that more intentional care would help. You handle most challenges with composure, though some situations may stretch your capacity.",
    advice: "Small, consistent practices — journaling, rest, community, reflection — can elevate you from stable to truly thriving. The gap is closer than you think.",
  };
  if (avg <= 4) return {
    label: "Struggling",
    tagline: "You're carrying more than you should alone.",
    icon: "🌦",
    color: "#78350F", accent: "#D97706", bg: "#FFFBEB", border: "#FDE68A", bar: "#F59E0B",
    description: "Your responses suggest you may be experiencing significant emotional challenges that are showing up in your daily life. This is more common than you may realize — and acknowledging it is already a courageous step.",
    advice: "Speaking with a trusted mentor, counselor, or joining a supportive community can make a real difference. You don't have to carry this weight alone — reaching out is strength, not weakness.",
  };
  return {
    label: "Critical",
    tagline: "Please reach out — you deserve real support.",
    icon: "🌧",
    color: "#7F1D1D", accent: "#DC2626", bg: "#FEF2F2", border: "#FECACA", bar: "#EF4444",
    description: "Your responses indicate that you may be in a state of significant emotional distress. Please know that what you're experiencing is real, valid, and deserving of proper care and attention.",
    advice: "We strongly encourage you to reach out to a mental health professional or a deeply trusted person in your life as soon as possible. This assessment is a first step — the next step matters most.",
  };
}

// ─── Average Score Circle (avg / 5) ──────────────────────────────────────────
function CircleScore({ avg, color }) {
  const [animated, setAnimated] = useState(0);
  const r = 54, circ = 2 * Math.PI * r;
  const pct = Math.round(((parseFloat(avg) - 1) / 4) * 100);
  const offset = circ - (animated / 100) * circ;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(pct), 150);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <svg width="168" height="168" viewBox="0 0 168 168">
      <circle cx="84" cy="84" r={r} fill="none" stroke="#E5E7EB" strokeWidth="10" />
      <circle cx="84" cy="84" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 84 84)"
        style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(0.34,1.56,0.64,1)" }}
      />
      <text x="84" y="76" textAnchor="middle" fontSize="36" fontWeight="700"
        fill="#111827" fontFamily="'Playfair Display', serif">{avg}</text>
      <text x="84" y="97" textAnchor="middle" fontSize="11" fill="#9CA3AF"
        fontFamily="'DM Sans', sans-serif" letterSpacing="1.5">OUT OF 5</text>
    </svg>
  );
}

// ─── Section Progress Bar ─────────────────────────────────────────────────────
function SectionBar({ label, title, score, min, max, color }) {
  const pct = Math.max(0, Math.min(100, Math.round(((score - min) / (max - min)) * 100)));
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 300); return () => clearTimeout(t); }, [pct]);

  return (
    <div style={{ marginBottom: "18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px", alignItems: "baseline" }}>
        <div>
          <span style={{ fontSize: "12px", fontWeight: "700", color, textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</span>
          <span style={{ fontSize: "13px", color: "#4B5563", marginLeft: "8px" }}>{title}</span>
        </div>
        <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
          {score}<span style={{ color: "#9CA3AF", fontWeight: "400" }}>/{max}</span>
        </span>
      </div>
      <div style={{ height: "7px", backgroundColor: "#F3F4F6", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${w}%`, backgroundColor: color,
          borderRadius: "999px", transition: "width 1s cubic-bezier(0.34,1.56,0.64,1) 0.4s",
        }} />
      </div>
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────
function QuestionCard({ q, answer, onAnswer, color }) {
  return (
    <div style={{
      backgroundColor: "#fff", borderRadius: "14px", padding: "22px", marginBottom: "10px",
      border: `1.5px solid ${answer ? color + "30" : "#F3F4F6"}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "border-color 0.2s",
    }}>
      <p style={{ fontSize: "14px", fontWeight: "500", color: "#1F2937", lineHeight: "1.6", marginBottom: "16px" }}>
        <span style={{ color, fontWeight: "700", marginRight: "8px" }}>{q.id}.</span>
        {q.text}
      </p>
      <div style={{ display: "flex", gap: "6px" }}>
        {SCALE.map(opt => {
          const selected = answer === opt.value;
          return (
            <button key={opt.value} onClick={() => onAnswer(q.id, opt.value)} style={{
              flex: 1, padding: "9px 4px 8px",
              border: `1.5px solid ${selected ? color : "#E5E7EB"}`,
              borderRadius: "9px",
              backgroundColor: selected ? color : "#FAFAFA",
              color: selected ? "#fff" : "#9CA3AF",
              fontSize: "13px", fontWeight: "700", cursor: "pointer",
              transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
            }}>
              {opt.value}
              <span style={{ fontSize: "9px", fontWeight: "400", opacity: 0.85, lineHeight: 1 }}>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Admin Login ──────────────────────────────────────────────────────────────
function AdminLogin({ onLogin, onBack }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");

  function handleLogin() {
    if (ADMIN_USERS[email.trim()] && ADMIN_USERS[email.trim()] === password) {
      onLogin(email.trim());
    } else {
      setError("Incorrect email or password.");
    }
  }

  const inp = (err) => ({
    width: "100%", boxSizing: "border-box", padding: "11px 14px",
    border: `1.5px solid ${err ? "#EF4444" : "#E2E4DF"}`,
    borderRadius: "10px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
    outline: "none", color: "#111827", backgroundColor: "#FAFAF9",
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F9F7", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "18px", padding: "40px 36px", width: "100%", maxWidth: "400px", boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 28px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ width: "48px", height: "48px", backgroundColor: "#1B4332", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: "22px" }}>🔐</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "600", color: "#0F172A", margin: "0 0 4px" }}>Admin Portal</h2>
          <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>LTL Academy — Assessment Dashboard</p>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Email</label>
          <input style={inp(error)} type="email" placeholder="admin@email.com" value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }} />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Password</label>
          <input style={inp(error)} type="password" placeholder="••••••••••" value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
          {error && <p style={{ fontSize: "12px", color: "#EF4444", marginTop: "5px", marginBottom: 0 }}>{error}</p>}
        </div>

        <button onClick={handleLogin} style={{ width: "100%", padding: "13px 24px", backgroundColor: "#1B4332", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          Sign In →
        </button>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "block", margin: "16px auto 0", padding: 0 }}>
          ← Back to Assessment
        </button>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ adminEmail, onLogout }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState(null);
  const [copied, setCopied]           = useState(null);

  async function loadData() {
    setLoading(true);
    const rows = await fetchSubmissions();
    setSubmissions(rows);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const filtered = submissions.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const labelColor = { Thriving: "#16A34A", Stable: "#2563EB", Struggling: "#D97706", Critical: "#DC2626" };

  function copyText(text, key) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function copyAllEmails() {
    copyText(filtered.map(s => s.email).join(", "), "all");
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8F9F7", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ backgroundColor: "#1B4332", padding: "0 28px", height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "600", color: "#fff", letterSpacing: "-0.2px" }}>LTL Academy — Admin</span>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "12px", color: "#86EFAC" }}>{adminEmail}</span>
          <button onClick={onLogout} style={{ background: "none", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: "8px", padding: "5px 14px", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "980px", margin: "0 auto", padding: "28px 18px 60px" }}>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          {[
            { label: "Total Submissions", value: submissions.length },
            {
              label: "Avg Score (all)",
              value: submissions.length
                ? (submissions.reduce((s, r) => s + parseFloat(r.avg), 0) / submissions.length).toFixed(2) + " / 5"
                : "—",
            },
            {
              label: "Most Recent",
              value: submissions[0]
                ? new Date(submissions[0].id).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                : "—",
            },
          ].map(stat => (
            <div key={stat.label} style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "16px 20px", flex: "1 1 140px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</p>
              <p style={{ fontSize: "22px", fontWeight: "700", color: "#0F172A", margin: 0, fontFamily: "'Playfair Display', serif" }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search + actions */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
          <input
            placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: "1 1 220px", padding: "10px 14px", border: "1.5px solid #E2E4DF", borderRadius: "10px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", backgroundColor: "#fff" }}
          />
          <button onClick={copyAllEmails} style={{ padding: "10px 18px", backgroundColor: "#fff", border: "1.5px solid #E2E4DF", borderRadius: "10px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", color: "#374151", whiteSpace: "nowrap" }}>
            {copied === "all" ? "✓ Copied!" : `Copy All Emails (${filtered.length})`}
          </button>
          <button onClick={loadData} style={{ padding: "10px 14px", backgroundColor: "#fff", border: "1.5px solid #E2E4DF", borderRadius: "10px", fontSize: "16px", cursor: "pointer", color: "#9CA3AF" }}>
            ↺
          </button>
        </div>

        {/* List + detail */}
        {loading ? (
          <div style={{ backgroundColor: "#fff", borderRadius: "14px", padding: "48px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <p style={{ color: "#9CA3AF", fontSize: "14px", margin: 0 }}>Loading submissions…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ backgroundColor: "#fff", borderRadius: "14px", padding: "48px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: "32px", marginBottom: "8px" }}>📭</p>
            <p style={{ color: "#9CA3AF", fontSize: "14px", margin: 0 }}>
              {search ? "No results match your search." : "No submissions yet. Results from any device will appear here once someone completes an assessment."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>

            {/* List */}
            <div style={{ flex: selected ? "0 0 360px" : "1", minWidth: 0 }}>
              {filtered.map(s => (
                <div key={s.id}
                  onClick={() => setSelected(selected?.id === s.id ? null : s)}
                  style={{
                    backgroundColor: "#fff", borderRadius: "12px", padding: "16px 18px", marginBottom: "8px",
                    border: `1.5px solid ${selected?.id === s.id ? "#1B4332" : "#F3F4F6"}`,
                    cursor: "pointer", transition: "border-color 0.15s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</p>
                      <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</p>
                      <p style={{ fontSize: "11px", color: "#C4C9C2", margin: "4px 0 0" }}>
                        {new Date(s.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", marginLeft: "12px", flexShrink: 0 }}>
                      <span style={{ fontSize: "20px", fontWeight: "700", color: "#111827", fontFamily: "'Playfair Display', serif" }}>{s.avg}</span>
                      <span style={{ fontSize: "11px", color: "#9CA3AF" }}> /5</span>
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: labelColor[s.label] || "#374151" }}>{s.label}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                    <button
                      onClick={e => { e.stopPropagation(); copyText(s.email, s.id); }}
                      style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #E2E4DF", background: "#FAFAF9", cursor: "pointer", color: copied === s.id ? "#16A34A" : "#6B7280", fontFamily: "'DM Sans', sans-serif" }}>
                      {copied === s.id ? "✓ Copied" : "Copy email"}
                    </button>
                    <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", backgroundColor: (labelColor[s.label] || "#374151") + "15", color: labelColor[s.label] || "#374151", fontWeight: "600" }}>
                      A:{s.sA} B:{s.sB} C:{s.sC}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail panel */}
            {selected && (
              <div style={{ flex: 1, minWidth: 0, position: "sticky", top: "16px" }}>
                <div style={{ backgroundColor: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
                    <div>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: "600", color: "#0F172A", margin: "0 0 3px" }}>{selected.name}</h3>
                      <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>{selected.email}</p>
                    </div>
                    <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9CA3AF", padding: "0 4px", lineHeight: 1 }}>×</button>
                  </div>

                  <div style={{ backgroundColor: (labelColor[selected.label] || "#374151") + "10", borderRadius: "12px", padding: "18px", marginBottom: "18px", textAlign: "center" }}>
                    <p style={{ fontSize: "38px", fontWeight: "700", color: "#111827", fontFamily: "'Playfair Display', serif", margin: "0 0 2px" }}>
                      {selected.avg}<span style={{ fontSize: "16px", color: "#9CA3AF", fontWeight: "400" }}>/5</span>
                    </p>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: labelColor[selected.label] || "#374151" }}>{selected.label}</span>
                    <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "6px 0 0" }}>Total {selected.total}/80 · A:{selected.sA}/20 · B:{selected.sB}/30 · C:{selected.sC}/30</p>
                  </div>

                  <SectionBar label="Section A" title="Emotional Stability"   score={selected.sA} min={4} max={20} color={SECTION_META.A.color} />
                  <SectionBar label="Section B" title="Distress & Reactivity" score={selected.sB} min={6} max={30} color={SECTION_META.B.color} />
                  <SectionBar label="Section C" title="Emotional Expression"  score={selected.sC} min={6} max={30} color={SECTION_META.C.color} />

                  {selected.reflection && (
                    <div style={{ marginTop: "16px", borderTop: "1px solid #E9ECE6", paddingTop: "14px" }}>
                      <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Reflection (Q17)</p>
                      <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: "1.65", margin: 0, fontStyle: "italic" }}>"{selected.reflection}"</p>
                    </div>
                  )}

                  <button
                    onClick={() => copyText(selected.email, selected.id + "_d")}
                    style={{ width: "100%", padding: "10px", border: "1.5px solid #E2E4DF", borderRadius: "10px", backgroundColor: "#FAFAF9", fontSize: "13px", cursor: "pointer", color: copied === selected.id + "_d" ? "#16A34A" : "#374151", fontFamily: "'DM Sans', sans-serif", fontWeight: "500", marginTop: "18px" }}>
                    {copied === selected.id + "_d" ? "✓ Email copied!" : "Copy email address"}
                  </button>

                  <p style={{ fontSize: "11px", color: "#C4C9C2", margin: "12px 0 0", textAlign: "center" }}>
                    Submitted {new Date(selected.created_at).toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════════════
export default function App() {
  const [view, setView]               = useState("assessment");
  const [adminUser, setAdminUser]     = useState(null);
  const [step, setStep]               = useState(0);
  const [participant, setParticipant] = useState({ name: "", email: "" });
  const [answers, setAnswers]         = useState({});
  const [reflection, setReflection]   = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [results, setResults]         = useState(null);
  const [errors, setErrors]           = useState({});
  const [copied, setCopied]           = useState(false);
  const topRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const sectionQs   = (s) => ALL_QUESTIONS.filter(q => q.section === s);
  const sectionDone = (s) => sectionQs(s).every(q => answers[q.id] !== undefined);
  const curSection  = () => step === 1 ? "A" : step === 2 ? "B" : step === 3 ? "C" : null;

  const calcResults = () => {
    const total = Object.values(answers).reduce((s, v) => s + v, 0);
    const avg   = total / 16;
    const sA = sectionQs("A").reduce((s, q) => s + (answers[q.id] || 0), 0);
    const sB = sectionQs("B").reduce((s, q) => s + (answers[q.id] || 0), 0);
    const sC = sectionQs("C").reduce((s, q) => s + (answers[q.id] || 0), 0);
    return { total, avg: avg.toFixed(2), sA, sB, sC, interpretation: getInterpretation(avg) };
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const r = calcResults();
    setResults(r);
    await saveSubmission({
      name: participant.name, email: participant.email,
      date: new Date().toISOString(),
      avg: r.avg, total: r.total,
      sA: r.sA, sB: r.sB, sC: r.sC,
      label: r.interpretation.label,
      reflection: reflection || "",
    });
    setSubmitting(false);
    setStep(5);
  };

  const copyResults = () => {
    if (!results) return;
    const text = [
      "EWAQ SUBMISSION — LTL Academy",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `Name:    ${participant.name}`,
      `Email:   ${participant.email}`,
      `Date:    ${new Date().toLocaleString()}`,
      "",
      `AVERAGE SCORE:  ${results.avg} / 5.00  →  ${results.interpretation.label}`,
      `Total:          ${results.total} / 80`,
      `Section A (Stability):   ${results.sA}/20`,
      `Section B (Reactivity):  ${results.sB}/30`,
      `Section C (Expression):  ${results.sC}/30`,
      "",
      "REFLECTION (Q17)",
      reflection || "Not provided",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const S = {
    page:     { minHeight: "100vh", backgroundColor: "#F8F9F7", fontFamily: "'DM Sans', sans-serif", color: "#111827" },
    header:   { position: "sticky", top: 0, zIndex: 20, backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid #ECEDE9", padding: "0 24px", height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo:     { fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: "600", color: "#1B4332", letterSpacing: "-0.2px" },
    progress: { height: "3px", backgroundColor: "#E9ECE6", width: "100%" },
    progressFill: (pct) => ({ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#1B4332,#2D7A50)", transition: "width 0.5s ease" }),
    wrap:     { maxWidth: "620px", margin: "0 auto", padding: "28px 18px 80px" },
    card:     { backgroundColor: "#fff", borderRadius: "18px", padding: "36px", boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 28px rgba(0,0,0,0.06)" },
    badge:    (c) => ({ display: "inline-block", backgroundColor: c + "18", color: c, padding: "3px 11px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.7px", textTransform: "uppercase", marginBottom: "10px" }),
    h1:       { fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: "600", color: "#0F172A", lineHeight: "1.3", margin: "0 0 8px" },
    sub:      { fontSize: "14px", color: "#6B7280", lineHeight: "1.65", margin: "0 0 28px" },
    lbl:      { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
    inp:      (err) => ({ width: "100%", boxSizing: "border-box", padding: "11px 14px", border: `1.5px solid ${err ? "#EF4444" : "#E2E4DF"}`, borderRadius: "10px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", color: "#111827", transition: "border-color 0.2s", backgroundColor: "#FAFAF9" }),
    errTxt:   { fontSize: "11px", color: "#EF4444", marginTop: "4px" },
    btnPrimary: (disabled) => ({ width: "100%", padding: "13px 24px", backgroundColor: disabled ? "#9CA3AF" : "#1B4332", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s" }),
    btnGhost: { padding: "12px 20px", backgroundColor: "transparent", color: "#6B7280", border: "1.5px solid #E2E4DF", borderRadius: "10px", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  };

  // ── Admin routes ──────────────────────────────
  if (view === "admin-login") {
    return <AdminLogin
      onLogin={email => { setAdminUser(email); setView("admin-dashboard"); }}
      onBack={() => setView("assessment")}
    />;
  }
  if (view === "admin-dashboard") {
    return <AdminDashboard adminEmail={adminUser} onLogout={() => { setAdminUser(null); setView("assessment"); }} />;
  }

  // ── Results ───────────────────────────────────
  if (step === 5 && results) {
    const { avg, interpretation, sA, sB, sC, total } = results;
    return (
      <div style={S.page} ref={topRef}>
        <div style={S.header}>
          <span style={S.logo}>LTL Academy</span>
          <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: "500" }}>Assessment Complete</span>
        </div>

        <div style={S.wrap}>

          {/* Hero */}
          <div style={{ ...S.card, backgroundColor: interpretation.bg, border: `1px solid ${interpretation.border}`, marginBottom: "14px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
              <CircleScore avg={avg} color={interpretation.bar} />
            </div>
            <div style={{ fontSize: "36px", marginBottom: "4px" }}>{interpretation.icon}</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "30px", fontWeight: "600", color: interpretation.color, margin: "0 0 4px" }}>
              {interpretation.label}
            </h2>
            <p style={{ fontSize: "14px", color: "#6B7280", fontStyle: "italic", marginBottom: "20px" }}>
              {interpretation.tagline}
            </p>
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "20px", textAlign: "left" }}>
              <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.75", margin: "0 0 16px" }}>
                {interpretation.description}
              </p>
              <div style={{ borderTop: "1px solid #E9ECE6", paddingTop: "14px" }}>
                <p style={{ fontSize: "12px", fontWeight: "700", color: interpretation.accent, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "6px" }}>
                  💡 Recommendation
                </p>
                <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: "1.7", margin: 0 }}>
                  {interpretation.advice}
                </p>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div style={{ ...S.card, marginBottom: "14px" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: "600", color: "#0F172A", margin: "0 0 4px" }}>
              Score Breakdown
            </h3>
            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 20px" }}>
              Average {avg} / 5.00 · Total {total} / 80
            </p>
            <SectionBar label="Section A" title="Emotional Stability"   score={sA} min={4} max={20} color={SECTION_META.A.color} />
            <SectionBar label="Section B" title="Distress & Reactivity" score={sB} min={6} max={30} color={SECTION_META.B.color} />
            <SectionBar label="Section C" title="Emotional Expression"  score={sC} min={6} max={30} color={SECTION_META.C.color} />
            <div style={{ backgroundColor: "#F8F9F7", borderRadius: "10px", padding: "12px 14px", marginTop: "14px" }}>
              <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0, lineHeight: "1.6" }}>
                Higher section scores indicate more frequent emotional challenges in that area. Scored on a 1–5 scale.
              </p>
            </div>
          </div>

          {/* Participant card */}
          <div style={{ ...S.card, marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Submitted by</p>
                <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: "0 0 2px" }}>{participant.name}</p>
                <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 6px" }}>{participant.email}</p>
                <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
                  {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "28px", fontWeight: "700", color: interpretation.color, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{avg}</div>
                <div style={{ fontSize: "12px", color: "#9CA3AF" }}>/ 5.00</div>
                <div style={{ marginTop: "4px", fontSize: "12px", fontWeight: "700", color: interpretation.accent }}>{interpretation.label}</div>
              </div>
            </div>
            {reflection && (
              <div style={{ borderTop: "1px solid #E9ECE6", marginTop: "16px", paddingTop: "14px" }}>
                <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Reflection (Q17)</p>
                <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: "1.65", margin: 0, fontStyle: "italic" }}>"{reflection}"</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={{ ...S.btnGhost, flex: 1 }} onClick={copyResults}>
              {copied ? "✓ Copied!" : "Copy Results"}
            </button>
            <button style={{ ...S.btnPrimary(false), flex: 2 }} onClick={() => {
              setStep(0); setAnswers({}); setReflection("");
              setParticipant({ name: "", email: "" }); setResults(null); setErrors({});
            }}>
              Take Assessment Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Assessment steps 0–4 ──────────────────────
  const renderContent = () => {

    if (step === 0) return (
      <div style={S.card}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "44px", marginBottom: "14px", lineHeight: 1 }}>🌿</div>
          <h1 style={{ ...S.h1, textAlign: "center" }}>Emotional Wellness<br />Assessment</h1>
          <p style={{ ...S.sub, marginBottom: 0, maxWidth: "400px", margin: "8px auto 0" }}>
            A short 16-question self-assessment that reveals how you're doing emotionally — across stability, reactivity, and expression.
          </p>
        </div>

        <div style={{ backgroundColor: "#F8F9F7", border: "1px solid #E9ECE6", borderRadius: "12px", padding: "16px 18px", marginBottom: "26px" }}>
          <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: "1.65", margin: 0 }}>
            <strong style={{ color: "#374151" }}>Instructions:</strong> For each statement, choose the option that best reflects how <em>frequently</em> it describes your current experience. There are no right or wrong answers — honesty gives the most accurate result. Takes about <strong>3–5 minutes.</strong>
          </p>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label style={S.lbl}>Full Name *</label>
          <input style={S.inp(errors.name)} placeholder="Enter your full name" value={participant.name}
            onChange={e => { setParticipant(p => ({ ...p, name: e.target.value })); setErrors(er => ({ ...er, name: null })); }} />
          {errors.name && <p style={S.errTxt}>{errors.name}</p>}
        </div>

        <div style={{ marginBottom: "28px" }}>
          <label style={S.lbl}>Email Address *</label>
          <input style={S.inp(errors.email)} placeholder="Enter your email address" type="email" value={participant.email}
            onChange={e => { setParticipant(p => ({ ...p, email: e.target.value })); setErrors(er => ({ ...er, email: null })); }} />
          {errors.email && <p style={S.errTxt}>{errors.email}</p>}
        </div>

        <button style={S.btnPrimary(false)} onClick={() => {
          const e = {};
          if (!participant.name.trim()) e.name = "Please enter your name.";
          if (!participant.email.trim() || !/\S+@\S+\.\S+/.test(participant.email)) e.email = "Please enter a valid email address.";
          if (Object.keys(e).length) { setErrors(e); return; }
          setStep(1);
        }}>
          Begin Assessment →
        </button>

        <p style={{ textAlign: "center", fontSize: "11px", color: "#9CA3AF", marginTop: "14px" }}>
          Your responses are confidential and used only for this assessment.
        </p>
        <p style={{ textAlign: "center", marginTop: "20px", marginBottom: 0 }}>
          <button onClick={() => setView("admin-login")} style={{ background: "none", border: "none", fontSize: "11px", color: "#D1D5DB", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: 0 }}>
            Admin
          </button>
        </p>
      </div>
    );

    if ([1, 2, 3].includes(step)) {
      const sec  = curSection();
      const meta = SECTION_META[sec];
      const qs   = sectionQs(sec);
      const done = sectionDone(sec);
      const answered = qs.filter(q => answers[q.id]).length;

      return (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <span style={S.badge(meta.color)}>{meta.label}</span>
            <h2 style={{ ...S.h1, fontSize: "21px" }}>{meta.title}</h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ ...S.sub, marginBottom: 0 }}>How often does each statement describe your experience?</p>
              <span style={{ fontSize: "12px", color: "#9CA3AF", whiteSpace: "nowrap", marginLeft: "12px" }}>
                {answered}/{qs.length} answered
              </span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#fff", borderRadius: "10px", padding: "10px 16px", marginBottom: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            {SCALE.map(s => (
              <div key={s.value} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#374151" }}>{s.value}</div>
                <div style={{ fontSize: "9px", color: "#9CA3AF" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {qs.map(q => (
            <QuestionCard key={q.id} q={q} answer={answers[q.id]}
              onAnswer={(id, val) => setAnswers(a => ({ ...a, [id]: val }))}
              color={meta.color} />
          ))}

          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <button style={{ ...S.btnGhost, flex: "0 0 auto" }} onClick={() => setStep(step - 1)}>← Back</button>
            <button style={{ ...S.btnPrimary(!done), flex: 1 }} onClick={() => done && setStep(step + 1)}>
              {step === 3 ? "Continue to Reflection →" : "Next Section →"}
            </button>
          </div>
          {!done && (
            <p style={{ textAlign: "center", fontSize: "12px", color: "#D97706", marginTop: "8px" }}>
              Please answer all {qs.length} questions to continue.
            </p>
          )}
        </div>
      );
    }

    if (step === 4) return (
      <div style={S.card}>
        <span style={S.badge("#6B7280")}>Open Reflection</span>
        <h2 style={{ ...S.h1, fontSize: "21px" }}>One Final Question</h2>
        <p style={S.sub}>This is optional but encouraged — your answer gives a fuller picture of your emotional experience.</p>

        <div style={{ backgroundColor: "#F8F9F7", borderLeft: "3px solid #1B4332", borderRadius: "0 10px 10px 0", padding: "16px 18px", marginBottom: "20px" }}>
          <p style={{ fontSize: "14px", fontWeight: "500", color: "#1F2937", lineHeight: "1.6", margin: 0 }}>
            <span style={{ color: "#1B4332", fontWeight: "700", marginRight: "6px" }}>17.</span>
            Mention three ways you usually react — or things you do — when you are stressed, emotionally overwhelmed, or anxious.
          </p>
        </div>

        <textarea style={{ ...S.inp(false), minHeight: "130px", resize: "vertical", lineHeight: "1.65" }}
          placeholder="e.g. I withdraw from people, I listen to music, I pray or journal..."
          value={reflection} onChange={e => setReflection(e.target.value)} />

        <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
          <button style={{ ...S.btnGhost, flex: "0 0 auto" }} onClick={() => setStep(3)}>← Back</button>
          <button style={{ ...S.btnPrimary(submitting), flex: 1 }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Calculating results…" : "View My Results →"}
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: "11px", color: "#9CA3AF", marginTop: "10px" }}>
          You may leave this blank and still view your results.
        </p>
      </div>
    );

    return null;
  };

  const progressPct = step === 0 ? 0 : (step / 5) * 100;

  return (
    <div style={S.page}>
      <div ref={topRef} />
      <div style={S.header}>
        <span style={S.logo}>LTL Academy</span>
        {step > 0 && (
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
            {step === 4 ? "Reflection" : `Section ${curSection()}`} · {step} of 5
          </span>
        )}
      </div>
      {step > 0 && (
        <div style={S.progress}>
          <div style={S.progressFill(progressPct)} />
        </div>
      )}
      <div style={S.wrap}>
        {renderContent()}
      </div>
    </div>
  );
}
