// Server-side calendar fetcher using ical.js.
// Pulls iCal feeds from Gmail, Outlook, and iCloud.
// Returns today's and tomorrow's events in America/Detroit timezone.

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ICAL = require("ical.js");

export type CalendarEvent = {
  time: string;   // "12:00 PM" or "All Day"
  text: string;
  bucket: number;
  allDay: boolean;
  sortKey: number; // minutes since midnight for sorting
};

export type ScheduleData = {
  today: CalendarEvent[];
  tomorrow: CalendarEvent[];
};

function normalizeUrl(url: string): string {
  return url.replace(/^webcal:\/\//i, "https://");
}

function formatTime(jsDate: Date): string {
  return jsDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Detroit",
  });
}

function dateStringET(jsDate: Date): string {
  return jsDate.toLocaleDateString("en-CA", { timeZone: "America/Detroit" });
}

function tomorrowStringET(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString("en-CA", { timeZone: "America/Detroit" });
}

function todayStringET(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Detroit" });
}

async function fetchCalendar(url: string): Promise<{ today: CalendarEvent[]; tomorrow: CalendarEvent[] }> {
  try {
    const normalized = normalizeUrl(url);
    const res = await fetch(normalized, { next: { revalidate: 300 } });
    if (!res.ok) return { today: [], tomorrow: [] };
    const text = await res.text();

    const todayStr = todayStringET();
    const tomorrowStr = tomorrowStringET();

    const jcal = ICAL.parse(text);
    const comp = new ICAL.Component(jcal);
    const vevents = comp.getAllSubcomponents("vevent");

    const today: CalendarEvent[] = [];
    const tomorrow: CalendarEvent[] = [];

    for (const vevent of vevents) {
      const event = new ICAL.Event(vevent);
      const status = vevent.getFirstPropertyValue("status");
      if (status === "CANCELLED") continue;

      const startProp = vevent.getFirstProperty("dtstart");
      if (!startProp) continue;

      const isAllDay = startProp.type === "date";
      const startDate: Date = event.startDate.toJSDate();

      if (isAllDay) {
        const dateStr = startDate.toISOString().slice(0, 10);
        const ev = { time: "All Day", text: event.summary || "(no title)", bucket: 0, allDay: true, sortKey: -1 };
        if (dateStr === todayStr) today.push(ev);
        else if (dateStr === tomorrowStr) tomorrow.push(ev);
      } else {
        const dateStr = dateStringET(startDate);
        const etDate = new Date(startDate.toLocaleString("en-US", { timeZone: "America/Detroit" }));
        const sortKey = etDate.getHours() * 60 + etDate.getMinutes();
        const ev = { time: formatTime(startDate), text: event.summary || "(no title)", bucket: 0, allDay: false, sortKey };
        if (dateStr === todayStr) today.push(ev);
        else if (dateStr === tomorrowStr) tomorrow.push(ev);
      }
    }

    return { today, tomorrow };
  } catch (e) {
    console.error("Calendar fetch error:", e);
    return { today: [], tomorrow: [] };
  }
}

function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.sort((a, b) => {
    if (a.allDay && !b.allDay) return -1;
    if (!a.allDay && b.allDay) return 1;
    return a.sortKey - b.sortKey;
  });
}

export async function getSchedule(): Promise<ScheduleData> {
  const urls = [
    process.env.ICAL_GMAIL_URL,
    process.env.ICAL_OUTLOOK_URL,
    process.env.ICAL_ICLOUD_URL,
  ].filter(Boolean) as string[];

  const results = await Promise.all(urls.map(fetchCalendar));

  return {
    today: sortEvents(results.flatMap(r => r.today)),
    tomorrow: sortEvents(results.flatMap(r => r.tomorrow)),
  };
}
