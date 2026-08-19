"use client";

import { X } from "lucide-react";
import { WorldMap } from "@/components/ui/map";

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  dots: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
}

export function MapModal({ isOpen, onClose, dots }: MapModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-40 transition-opacity" onClick={onClose} />

      <div className="fixed inset-4 z-50 flex flex-col bg-white rounded-lg shadow-2xl md:inset-12">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-[#1a1a2e]">Worldwide Access</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close map">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-4">
          <div className="h-full w-full">
            <WorldMap dots={dots} lineColor="#E8671A" showLabels animationDuration={2} loop />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            We process visa applications from {dots.length} major cities across the globe
          </p>
        </div>
      </div>
    </>
  );
}
