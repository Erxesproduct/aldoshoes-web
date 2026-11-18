"use client";

import { useState } from "react";

type Row = [us: string, uk: string, eu: string, inch: number, cm: number];

/** Foot length (cm) → the nearest size in the shop's own men's chart. */
export function SizeFinder({ chart }: { chart: Row[] }) {
  const min = chart[0][4];
  const max = chart[chart.length - 1][4];
  const [cm, setCm] = useState(26);
  const row = chart.reduce((best, r) => (Math.abs(r[4] - cm) < Math.abs(best[4] - cm) ? r : best), chart[0]);
  return (
    <div className="bg-white p-6 md:p-8">
      <label htmlFor="foot" className="kicker text-[13px]">
        Хөлийн урт: <span className="text-cherry">{cm.toFixed(1)} см</span>
      </label>
      <input id="foot" type="range" min={min - 0.4} max={max + 0.4} step={0.1} value={cm} onChange={(e) => setCm(Number(e.target.value))} className="mt-4 w-full accent-[var(--cherry)]" />
      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        {(
          [
            ["EU", row[2]],
            ["US", row[0]],
            ["UK", row[1]],
          ] as const
        ).map(([k, v], i) => (
          <div key={k} className={i === 0 ? "bg-ink py-4 text-white" : "studio py-4"}>
            <p className="kicker text-[12px] opacity-70">{k}</p>
            <p key={v} className="display fade-in mt-1 text-[44px]">
              {v}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[13px] text-mute">Хөлөө цаасан дээр тавьж өсгийнөөс эрхий хуруу хүртэл хэмжээрэй. Хүснэгтийн хамгийн ойр хэмжээг харуулна; эргэлзвэл утсаар зөвлөгөө аваарай.</p>
    </div>
  );
}
