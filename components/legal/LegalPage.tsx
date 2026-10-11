import { notFound } from "next/navigation";
import { getLegalDocument } from "@/lib/cms/site";
import { Container } from "@/components/ui/Layout";
import { SimpleMarkdown } from "@/components/ui/SimpleMarkdown";
import styles from "./LegalPage.module.css";

const updatedFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });

/** Shared renderer for Privacy Policy and Terms (content from legal_documents). */
export async function LegalPage({ slug }: { slug: "privacy" | "terms" }) {
  const doc = await getLegalDocument(slug);
  if (!doc) notFound();
  return (
    <article className={styles.page} aria-labelledby="legal-title">
      <Container className={styles.inner}>
        <header className={styles.head}>
          <p className="label">Legal</p>
          <h1 id="legal-title" className={styles.title}>
            {doc.title}
          </h1>
          <p className={styles.updated}>Last updated {updatedFormat.format(new Date(doc.updatedAt))}</p>
        </header>
        <SimpleMarkdown source={doc.body} className={styles.body} />
      </Container>
    </article>
  );
}
