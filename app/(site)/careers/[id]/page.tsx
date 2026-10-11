import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBrands } from "@/lib/cms/brands";
import { getOpenJob, getOpenJobs } from "@/lib/cms/people";
import type { Section } from "@/lib/cms/types";
import { paragraphs, present } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Layout";
import { PageHero } from "@/components/ui/PageHero";
import { CmsText } from "@/components/ui/CmsText";
import { Icon } from "@/components/ui/Icon";
import { CareerForm } from "@/components/forms/Forms";
import css from "@/components/sections/careers.module.css";

export const revalidate = 300;

/** Open roles are prerendered; roles published later render on demand. */
export async function generateStaticParams() {
  const jobs = await getOpenJobs().catch(() => []);
  return jobs.map((j) => ({ id: j.id }));
}

export async function generateMetadata({ params }: PageProps<"/careers/[id]">): Promise<Metadata> {
  const { id } = await params;
  const job = await getOpenJob(id);
  if (!job) return {};
  const where = [job.brandName, job.location].filter(Boolean).join(", ");
  return buildMetadata(`job:${job.id}`, {
    title: `${job.title}${where ? ` — ${where}` : ""}`,
    description: present(job.summary) ?? `${job.title} · ${job.location} · ${job.employmentType}. Apply to join Litensity.`,
    path: `/careers/${job.id}`,
  });
}

/**
 * One page per open role: the role's details plus its application form, pre-tagged with the role.
 * Every role renders through this template; closed or archived roles 404.
 */
export default async function JobPage({ params }: PageProps<"/careers/[id]">) {
  const { id } = await params;
  const [job, jobs, brands] = await Promise.all([getOpenJob(id), getOpenJobs(), getBrands()]);
  if (!job) notFound();

  const hero: Section = {
    key: "job",
    eyebrow: job.brandName ?? "Open role",
    heading: job.title,
    subheading: null,
    body: `${job.location} · ${job.employmentType}`,
    cta: null,
    cta2: null,
    media: null,
    video: null,
  };

  return (
    <>
      <PageHero section={hero} variant="type" />
      <section className={css.applySection} id="apply" aria-labelledby="apply-title">
        <Container className={css.applyGrid}>
          <div className={css.roleDetails}>
            <CmsText as="p" value={job.summary} className={css.jobSummary} />
            {paragraphs(job.description).map((p, i) => (
              <CmsText key={i} as="p" value={p} />
            ))}
            {job.requirements && (
              <>
                <h2 className="label">Requirements</h2>
                {paragraphs(job.requirements).map((p, i) => (
                  <CmsText key={i} as="p" value={p} />
                ))}
              </>
            )}
            <Link href="/careers#roles" className={css.back}>
              <Icon name="arrow" size={16} className={css.backIcon} /> All open roles
            </Link>
          </div>
          <div>
            <h2 id="apply-title" className={css.formTitle}>
              Apply for this role
            </h2>
            <CareerForm
              tone="dark"
              jobId={job.id}
              role={job.title}
              roles={jobs.map((j) => j.title)}
              brands={brands.map((b) => ({ label: b.name, value: b.slug }))}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
