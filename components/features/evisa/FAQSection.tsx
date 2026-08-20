import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export async function EvisaFAQSection() {
  const t = await getTranslations("evisa.faq");
  const faqs = t.raw("items") as { q: string; a: string }[];
  const items = faqs.map((item, idx) => ({ id: `item-${idx + 1}`, ...item }));
  const firstHalf = items.slice(0, Math.ceil(items.length / 2));
  const secondHalf = items.slice(Math.ceil(items.length / 2));

  return (
    <section style={{ background: "#f9fafb" }} className="py-16">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[firstHalf, secondHalf].map((half, col) => (
            <Accordion key={col} type="single" collapsible className="w-full space-y-3">
              {half.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border border-gray-200 rounded-xl bg-white px-6 shadow-sm"
                >
                  <AccordionTrigger
                    className="cursor-pointer text-base font-semibold hover:no-underline py-5"
                    style={{ color: "#1a1a2e" }}
                  >
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm leading-relaxed text-gray-500 pb-4">{item.a}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          {t("stillHaveQuestions")}{" "}
          <Link href="/contact" className="font-semibold hover:underline" style={{ color: "#E8671A" }}>
            {t("contactSupport")}
          </Link>
        </p>
      </div>
    </section>
  );
}
