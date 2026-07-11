// Command Center — v1 dashboard.
// Server Component. Fetches dashboard data from Supabase, then renders the v5 layout.
// Stubs: weather + today's schedule (replaced by real integrations in v2).
// Display-only: bucket tiles do not open detail modals yet (v2).

import { getDashboardData } from "@/lib/queries";
import { getWeather } from "@/lib/weather";
import { getSchedule } from "@/lib/calendar";

// ============================================
// PALETTE — ported from v5
// ============================================
const C = {
  colors: ["#2B86A6", "#1A6B8A", "#3AA68F", "#6E8FAD", "#7A6DAD", "#3A8EA6"],
  text: "#1E3A4A",
  textMed: "#3D5F70",
  textLight: "#7A9AAD",
  textFaint: "#B0C8D4",
  glass: "rgba(255,255,255,0.52)",
  glassBorder: "rgba(255,255,255,0.40)",
  emerald: "#2A9D6E",
  coral: "#C75840",
  grey: "#8A8A8A",
};

const glassStyle: React.CSSProperties = {
  background: C.glass,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: 16,
  border: `1px solid ${C.glassBorder}`,
  boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
};

const fontSerif = "var(--font-libre), 'Libre Baskerville', serif";
const fontSans = "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif";

// ============================================
// STUBS — to be replaced in v2
// ============================================



const QUICK_LINKS = [
  { name: "Notion", url: "https://notion.so" },
  { name: "TTP", url: "https://www.targettestprep.com" },
  { name: "LinkedIn", url: "https://linkedin.com" },
  { name: "GitHub", url: "https://github.com/tilleryr" },
  { name: "Supabase", url: "https://supabase.com/dashboard" },
];

// ============================================
// ATOMS
// ============================================
function Bar({ value, color, h = 4 }: { value: number; color: string; h?: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: h,
        background: "rgba(255,255,255,0.45)",
        borderRadius: h,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.min(value, 100)}%`,
          height: "100%",
          background: color,
          borderRadius: h,
          transition: "width 0.6s ease",
        }}
      />
    </div>
  );
}

function SectionLabel({ children, color = C.colors[0] }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        color,
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        marginBottom: 14,
        fontFamily: fontSans,
      }}
    >
      {children}
    </div>
  );
}

// ============================================
// PAGE
// ============================================
// Day-of-year modulo 5 → stable photo pick for the whole day.
// Photos live in /public/backgrounds/01.jpg through 05.jpg.
function getBackgroundPhoto(d: Date): string {
  const startOfYear = new Date(d.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000);
  const photoIndex = (dayOfYear % 5) + 1; // 1..5
  return `/backgrounds/0${photoIndex}.jpeg`;
}

export default async function Dashboard() {
  const [data, weather, schedule] = await Promise.all([getDashboardData(), getWeather(), getSchedule()]);
  const now = new Date();
  const backgroundPhoto = getBackgroundPhoto(now);

  // Build the 6 bucket tiles from query data
  const tiles = [
    { id: "jobsearch", label: "JOB SEARCH", value: `${data.tiles.jobSearch.interviewRate}%`, sub: "Interview Rate", bucket: 0 },
    { id: "ttp", label: "TEST PREP", value: `${data.tiles.testPrep.completed}/${data.tiles.testPrep.total}`, sub: "Missions", bucket: 1 },
    { id: "portfolio", label: "AI PORTFOLIO", value: `${data.tiles.portfolio.inPlay}/${data.tiles.portfolio.total}`, sub: "Projects", bucket: 2 },
    { id: "content", label: "CONTENT", value: `${data.tiles.contentThisWeek}`, sub: "This Week", bucket: 3 },
    { id: "coursework", label: "COURSEWORK", value: `${data.tiles.coursework.done}/${data.tiles.coursework.due}`, sub: "Due This Week", bucket: 4 },
    { id: "emba", label: "EMBA", value: `${data.tiles.emba.shortlisted}/${data.tiles.emba.target}`, sub: "Shortlisted", bucket: 5 },
  ];

  const totalActualHours = data.weeklyTime.reduce((sum, b) => sum + Number(b.actual_hours), 0);

  return (
    <div style={{ minHeight: "100vh", fontFamily: fontSans, position: "relative" }}>
      {/* Layer 0: gradient — fallback if photo 404s, and base color story */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background:
            "linear-gradient(160deg, #1A6B8A 0%, #2B9EB3 20%, #5BB8C9 40%, #8AD4D6 55%, #E6DCC8 70%, #D4C9A8 85%, #A8B8A0 100%)",
        }}
      />
      {/* Layer 1: rotating photo — one per day, cycles through 5 */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          backgroundImage: `url(${backgroundPhoto})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Layer 2: readability tint — lifts glass cards off the photo */}
      <div style={{ position: "fixed", inset: 0, zIndex: 2, background: "rgba(240,245,248,0.22)" }} />

      <div style={{ position: "relative", zIndex: 3, padding: "28px 36px", maxWidth: 1400, margin: "0 auto" }}>
        {/* HEADER: Date + Weather */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontFamily: fontSerif,
              fontSize: 38,
              fontWeight: 400,
              color: "rgba(255,255,255,0.92)",
              lineHeight: 1.1,
              textShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            {now.toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Detroit" })},{" "}
            {now.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/Detroit" })}
          </div>
          <div style={{ ...glassStyle, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>{weather.icon}</span>
            <div>
              <span style={{ fontFamily: fontSerif, fontSize: 30, fontWeight: 400, color: C.text }}>
                {weather.temp}°
              </span>
              <div style={{ fontSize: 12, color: C.textLight }}>
                {weather.condition} · H {weather.high}° L {weather.low}°
              </div>
            </div>
          </div>
        </div>

        {/* ROW 1: Today | This Week | To Do */}
        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.875fr 0.875fr", gap: 14, marginBottom: 14 }}>
          {/* TODAY */}
          <div style={{ ...glassStyle, padding: 20 }}>
            <SectionLabel>Today</SectionLabel>
            {schedule.today.length === 0 ? (
              <div style={{ fontSize: 14, color: C.textLight, fontStyle: "italic" }}>No events today.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {schedule.today.map((r, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, color: C.colors[r.bucket], fontWeight: 700, fontFamily: "monospace", marginBottom: 3 }}>
                      {r.time}
                    </div>
                    <div style={{ fontSize: 14, color: C.text, lineHeight: 1.4, paddingLeft: 10, borderLeft: `3px solid ${C.colors[r.bucket]}` }}>
                      {r.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {schedule.tomorrow.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Tomorrow</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {schedule.tomorrow.map((r, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 11, color: C.textLight, fontFamily: "monospace", marginBottom: 2 }}>
                        {r.time}
                      </div>
                      <div style={{ fontSize: 13, color: C.textMed, lineHeight: 1.4, paddingLeft: 10, borderLeft: `2px solid ${C.textFaint}` }}>
                        {r.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* THIS WEEK */}
          <div style={{ ...glassStyle, padding: 20 }}>
            <SectionLabel>This Week</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.weeklyTime.map((b) => {
                const target = Number(b.target_hours);
                const actual = Number(b.actual_hours);
                const pct = target > 0 ? Math.round((actual / target) * 100) : 0;
                return (
                  <div key={b.bucket_id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{b.bucket_name}</span>
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "monospace",
                          fontWeight: 700,
                          color: b.color_hex,
                        }}
                      >
                        {actual}h{target > 0 ? ` / ${target}h` : ""}
                      </span>
                    </div>
                    <Bar value={pct} color={b.color_hex} />
                  </div>
                );
              })}
            </div>
            <div
              style={{
                borderTop: "1px solid rgba(0,0,0,0.05)",
                marginTop: 14,
                paddingTop: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.textLight,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Total
              </span>
              <span style={{ fontFamily: fontSerif, fontSize: 22, color: C.text }}>{totalActualHours}h</span>
            </div>
          </div>

          {/* GOALS — compact */}
          <div style={{ ...glassStyle, padding: 20 }}>
            <SectionLabel>Goals</SectionLabel>
            {data.goals.length === 0 ? (
              <div style={{ fontSize: 13, color: C.textLight, fontStyle: "italic" }}>No goals yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.goals.map((g) => {
                  const gc = g.bucket_id !== null ? C.colors[g.bucket_id] : C.textMed;
                  const days = g.deadline
                    ? Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000)
                    : null;
                  return (
                    <div key={g.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 13, color: gc, fontWeight: 600, lineHeight: 1.3, flex: 1, marginRight: 8 }}>
                          {g.goal}
                        </span>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                          {days !== null && (
                            <span style={{ fontSize: 11, color: days < 30 ? C.coral : C.textLight, fontFamily: "monospace" }}>
                              {days}d
                            </span>
                          )}
                          <span style={{ fontSize: 12, color: gc, fontWeight: 700 }}>{g.progress_pct}%</span>
                        </div>
                      </div>
                      <Bar value={g.progress_pct} color={gc} h={3} />
                    </div>
                  );
                })}
                {data.onHold.length > 0 && (
                  <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: 8, marginTop: 2 }}>
                    {data.onHold.map((item) => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.grey }}>{item.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: C.grey, textTransform: "uppercase", letterSpacing: "0.06em" }}>On Hold</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ROW 2: 6 Bucket Tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, marginBottom: 14 }}>
          {tiles.map((card) => {
            const bc = C.colors[card.bucket];
            return (
              <div key={card.id} style={{ ...glassStyle, padding: "22px 18px", textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: bc,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 10,
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontFamily: fontSerif,
                    fontSize: 34,
                    fontWeight: 400,
                    color: C.text,
                    lineHeight: 1,
                  }}
                >
                  {card.value}
                </div>
                <div style={{ fontSize: 12, color: C.textLight, marginTop: 8 }}>{card.sub}</div>
              </div>
            );
          })}
        </div>

        {/* ROW 3: To Do — two columns */}
        <div style={{ ...glassStyle, padding: 20, marginBottom: 14 }}>
          <SectionLabel>To Do</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Open todos */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Open</div>
              {data.openTodos.length === 0 ? (
                <div style={{ fontSize: 13, color: C.textLight, fontStyle: "italic" }}>No open tasks.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {data.openTodos.map((t) => {
                    const bucketColor = t.bucket_id !== null ? C.colors[t.bucket_id] : C.textFaint;
                    const days = t.due_date
                      ? Math.ceil((new Date(t.due_date).getTime() - Date.now()) / 86400000)
                      : null;
                    return (
                      <div key={t.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontSize: 14, color: C.text, lineHeight: 1.4, borderLeft: `3px solid ${bucketColor}`, paddingLeft: 8, flex: 1 }}>
                          {t.task}
                        </span>
                        {days !== null && (
                          <span style={{ fontSize: 11, fontFamily: "monospace", color: days <= 1 ? C.coral : days <= 7 ? "#C78A40" : C.textLight, flexShrink: 0 }}>
                            {days === 0 ? "today" : days < 0 ? `${Math.abs(days)}d over` : `${days}d`}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Completed todos */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Recently Done</div>
              {data.completedTodos.length === 0 ? (
                <div style={{ fontSize: 13, color: C.textLight, fontStyle: "italic" }}>Nothing completed yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {data.completedTodos.map((t) => {
                    const bucketColor = t.bucket_id !== null ? C.colors[t.bucket_id] : C.textFaint;
                    return (
                      <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ fontSize: 14, color: C.textLight, lineHeight: 1.4, borderLeft: `3px solid ${bucketColor}`, paddingLeft: 8, textDecoration: "line-through" }}>
                          {t.task}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          {QUICK_LINKS.map((l) => (
            <a
              key={l.name}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...glassStyle,
                fontSize: 12,
                fontWeight: 600,
                padding: "10px 18px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.3)",
                color: C.textMed,
                textDecoration: "none",
              }}
            >
              {l.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
