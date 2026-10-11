"use client";

import { useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Row = { day_of_week: number; opens_at: string | null; closes_at: string | null; is_closed: boolean };
type Day = { opens: string; closes: string; closed: boolean };

/** Weekly opening hours with a one-click "apply to all days". */
export function HoursField({ value }: { value: Row[] }) {
  const [days, setDays] = useState<Day[]>(() =>
    DAYS.map((_, i) => {
      const row = value.find((r) => r.day_of_week === i);
      return {
        opens: row?.opens_at?.slice(0, 5) ?? "11:00",
        closes: row?.closes_at?.slice(0, 5) ?? "23:00",
        closed: row?.is_closed ?? false,
      };
    }),
  );

  const update = (i: number, patch: Partial<Day>) => setDays((d) => d.map((day, j) => (j === i ? { ...day, ...patch } : day)));

  return (
    <div className="a-hours">
      {days.map((day, i) => (
        <div key={DAYS[i]} className="a-hours-row">
          <strong>{DAYS[i]}</strong>
          <input
            className="a-input"
            type="time"
            name={`hours_${i}_opens`}
            value={day.opens}
            disabled={day.closed}
            onChange={(e) => update(i, { opens: e.target.value })}
            aria-label={`${DAYS[i]} opens`}
          />
          <input
            className="a-input"
            type="time"
            name={`hours_${i}_closes`}
            value={day.closes}
            disabled={day.closed}
            onChange={(e) => update(i, { closes: e.target.value })}
            aria-label={`${DAYS[i]} closes`}
          />
          <label className="a-check">
            <input type="checkbox" name={`hours_${i}_closed`} checked={day.closed} onChange={(e) => update(i, { closed: e.target.checked })} />
            Closed
          </label>
        </div>
      ))}
      <div>
        <button type="button" className="a-btn a-btn-sm" onClick={() => setDays((d) => d.map(() => ({ ...d[0] })))}>
          Copy Monday to all days
        </button>
      </div>
      <p className="a-help">Closing after midnight (e.g. 11:00 → 01:00) is supported.</p>
    </div>
  );
}
