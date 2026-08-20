import { FileText, CreditCard, MailCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

const ICONS = [FileText, CreditCard, MailCheck];
const COLORS = ["#E8671A", "#3b82f6", "#10b981"];

export async function EvisaStepsSection() {
  const t = await getTranslations("evisa.steps");
  const items = t.raw("items") as { title: string; desc: string }[];

  return (
    <section className="relative z-30 bg-white -mt-10 md:-mt-16 rounded-t-[40px] md:rounded-t-[80px] px-5 md:px-12 lg:px-20 pt-4 pb-16">
      <div className="max-w-5xl mx-auto -mt-[25px] md:-mt-[45px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-stretch">
          {items.map((step, i) => {
            const Icon = ICONS[i];
            const color = COLORS[i];
            const number = String(i + 1).padStart(2, "0");
            return (
              <div key={number} className="relative group">
                {i < items.length - 1 && (
                  <div className="hidden md:flex absolute top-10 -right-3 z-10 items-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}

                <div className="bg-[#faf5ee] rounded-2xl px-5 py-4 md:px-6 md:py-5 flex flex-col gap-3
                  shadow-[0_4px_24px_rgba(0,0,0,0.1)]
                  hover:shadow-[0_12px_40px_rgba(232,103,26,0.18)]
                  hover:-translate-y-1
                  transition-all duration-300">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{ background: `${color}18` }}>
                      <Icon size={18} style={{ color }} strokeWidth={2} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold tracking-[2px] uppercase block"
                        style={{ color }}>
                        Step {number}
                      </span>
                      <h3 className="text-[20px] md:text-[22px] font-extrabold text-[#1a1a2e] leading-snug">
                        {step.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-[14px] md:text-[15px] text-gray-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
