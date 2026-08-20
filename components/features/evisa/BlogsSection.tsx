import { getTranslations } from "next-intl/server";
import BlogCard from "@/components/features/home/BlogCard";
import { postUrl } from "@/lib/postUrl";
import { tiptapText } from "@/lib/tiptapText";

type Props = {
  locale: string;
  posts: any[];
};

export async function EvisaBlogsSection({ locale, posts }: Props) {
  if (!posts || posts.length === 0) return null;
  const t = await getTranslations("evisa.blogs");

  return (
    <section className="bg-white py-16 px-5 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[10px] font-medium tracking-[2.5px] text-[#E8671A] uppercase mb-2">{t("label")}</p>
          <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#1a1a2e] leading-snug">
            {t("title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(0, 6).map((p: any) => (
            <BlogCard
              key={p._id}
              title={p.title}
              desc={tiptapText(p.content, 120)}
              image={p.coverImage || "/images/blog-1.jpg"}
              date={p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : ""}
              readTime={p.readTime ? `${p.readTime} min read` : ""}
              href={postUrl(locale, p.slug)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
