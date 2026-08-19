"use client";

import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";

type Country = {
  name: string;
  code: string;
  flag?: string;
  baseFee?: number;
};

const PAGE_SIZE = 16;

export function EvisaNationalitySection({ countries, locale }: { countries: Country[]; locale: string }) {
  const [query, setQuery] = useState("");
  const [showing, setShowing] = useState(PAGE_SIZE);

  const filtered = query.length > 0
    ? countries.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : countries;

  const visible = filtered.slice(0, showing);
  const hasMore = filtered.length > showing;

  return (
    <section className="bg-[#f4f6fa] py-20 px-5 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold tracking-[3px] text-[#E8671A] uppercase mb-3">Eligibility</p>
          <h2 className="text-[28px] md:text-[38px] font-extrabold text-[#1a1a2e] leading-tight mb-3">
            Check Your Nationality
          </h2>
          <p className="text-gray-400 text-[15px] max-w-lg mx-auto leading-relaxed">
            Find your country below to see your e-Visa fee and eligibility.
          </p>
        </div>

        <div className="relative max-w-xl mx-auto mb-12">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowing(PAGE_SIZE); }}
            placeholder="Search your country..."
            className="w-full pl-11 pr-5 py-4 rounded-2xl bg-white border border-gray-200
              text-[14px] text-gray-700 placeholder-gray-400
              shadow-[0_2px_20px_rgba(0,0,0,0.07)]
              focus:outline-none focus:ring-2 focus:ring-[#E8671A]/25 focus:border-[#E8671A]/50
              transition-all"
          />
        </div>

        {visible.length === 0 ? (
          <p className="text-center text-gray-400 py-16 text-[15px]">No countries match &ldquo;{query}&rdquo;.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visible.map((c) => (
              <a
                key={c.code}
                href="https://apply.azerbaijantravel.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 bg-white rounded-2xl px-5 py-4
                  border border-gray-100
                  shadow-[0_2px_12px_rgba(0,0,0,0.05)]
                  hover:border-[#E8671A]/40 hover:shadow-[0_8px_28px_rgba(232,103,26,0.13)]
                  hover:-translate-y-0.5 transition-all duration-250"
              >
                <div className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.flag || `https://flagcdn.com/w80/${c.code.toLowerCase()}.png`}
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#1a1a2e] group-hover:text-[#E8671A] transition-colors leading-tight truncate">
                    {c.name}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    {c.baseFee ? `From $${c.baseFee}` : "View eligibility"}
                  </p>
                </div>

                <ArrowRight size={15} className="text-gray-300 group-hover:text-[#E8671A] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </a>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowing((s) => s + PAGE_SIZE)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full
                border-2 border-[#E8671A] text-[#E8671A] font-bold text-[14px]
                hover:bg-[#E8671A] hover:text-white transition-all duration-200"
            >
              Load More
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
