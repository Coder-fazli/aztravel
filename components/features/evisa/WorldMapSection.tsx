"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { WorldMap } from "@/components/ui/map";
import { MapModal } from "@/components/ui/MapModal";
import { Maximize2 } from "lucide-react";

const BAKU = { lat: 40.41, lng: 49.87, label: "Baku" };

const dots = [
  { start: { lat: 40.7128, lng: -74.006, label: "New York" }, end: BAKU },
  { start: { lat: -23.5505, lng: -46.6333, label: "São Paulo" }, end: BAKU },
  { start: { lat: 51.5074, lng: -0.1278, label: "London" }, end: BAKU },
  { start: { lat: 55.7558, lng: 37.6173, label: "Moscow" }, end: BAKU },
  { start: { lat: 25.2048, lng: 55.2708, label: "Dubai" }, end: BAKU },
  { start: { lat: 28.6139, lng: 77.209, label: "New Delhi" }, end: BAKU },
  { start: { lat: 35.6762, lng: 139.6503, label: "Tokyo" }, end: BAKU },
  { start: { lat: -33.8688, lng: 151.2093, label: "Sydney" }, end: BAKU },
];

export function EvisaWorldMapSection() {
  const t = useTranslations("evisa.worldMap");
  const [mapModalOpen, setMapModalOpen] = useState(false);

  return (
    <>
      <section className="bg-white pt-6 pb-6 md:pb-12">
        <div className="max-w-2xl mx-auto text-center px-5 mb-4 md:mb-2">
          <p className="text-[10px] font-medium tracking-[2.5px] text-[#E8671A] uppercase mb-2">{t("label")}</p>
          <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#1a1a2e] leading-snug mb-2">
            {t("title")}
          </h2>
          <p className="text-gray-400 text-[13px] leading-relaxed font-normal">
            {t("description")}
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-5">
          <div className="relative">
            <button
              onClick={() => setMapModalOpen(true)}
              className="absolute top-3 right-3 z-10 md:hidden bg-[#E8671A] hover:bg-[#C9540D] text-white p-2 rounded-lg transition-colors shadow-md"
              aria-label="Expand map"
              title="View full screen map"
            >
              <Maximize2 size={18} />
            </button>

            <WorldMap dots={dots} lineColor="#E8671A" showLabels animationDuration={2} loop />
          </div>

          <div className="md:hidden mt-6">
            <div className="flex overflow-x-auto gap-3 pb-2 -mx-5 px-5">
              {dots.map((dot, idx) => (
                <div key={idx} className="flex-shrink-0 w-40 bg-gradient-to-br from-orange-50 to-white p-4 rounded-lg border border-orange-100 shadow-sm">
                  <p className="font-bold text-sm text-[#1a1a2e]">{dot.start.label}</p>
                  <p className="text-xs text-gray-500 mt-1">↓</p>
                  <p className="font-semibold text-sm text-[#E8671A]">Baku</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <MapModal isOpen={mapModalOpen} onClose={() => setMapModalOpen(false)} dots={dots} />
    </>
  );
}
