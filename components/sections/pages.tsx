import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { getBrands, getGallery } from "@/lib/cms/brands";
import { footprintOf, getStores } from "@/lib/cms/stores";
import { getContactDepartments, getSiteSettings } from "@/lib/cms/site";
import { getCsrInitiatives, getMilestones, getOpenJobs, getPeople } from "@/lib/cms/people";
import { brandVars } from "@/lib/color";
import { paragraphs, present, telHref, whatsappHref } from "@/lib/content";
import { Container, Section as Band, type SectionTone } from "@/components/ui/Layout";
import { SectionHead } from "@/components/ui/SectionHead";
import { CmsText } from "@/components/ui/CmsText";
import { ButtonLink } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { Gallery } from "@/components/ui/Gallery";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { OwnershipLabel } from "@/components/brand/OwnershipLabel";
import { PersonCard } from "@/components/people/PersonCard";
import { StoreLocator } from "@/components/stores/StoreLocator";
import { OfficeMap } from "@/components/stores/OfficeMap";
import { CareerForm, GeneralForm, InvestorForm } from "@/components/forms/Forms";
import { Tilt } from "@/components/ui/Tilt";
import { PinnedScroll } from "@/components/ui/PinnedScroll";
import type { SectionProps } from "./generic";
import brandsCss from "./brands.module.css";
import investCss from "./invest.module.css";
import aboutCss from "./about.module.css";
import csrCss from "./csr.module.css";
import careersCss from "./careers.module.css";
import contactCss from "./contact.module.css";

export type PageContext = { searchParams: Record<string, string | string[] | undefined> };
type Props = SectionProps & { ctx: PageContext };

const titleId = (s: SectionProps["section"]) => `${s.key}-title`;
const tone = (s: SectionProps["section"], fallback: SectionTone): SectionTone => (s.tone as SectionTone | null) ?? fallback;
const param = (v: string | string[] | undefined) => (typeof v === "string" && v.length <= 80 ? v : null);

/* ================================================================ Brands hub */

export async function BrandRowsSection() {
  const [brands, stores] = await Promise.all([getBrands(), getStores()]);
  const css = brandsCss;
  return (
    <section className={css.list} aria-label="Brands">
      {brands.map((brand, i) => {
        const fp = footprintOf(stores.filter((s) => s.brand.id === brand.id));
        return (
          <article
            key={brand.id}
            className={css.row}
            data-typeface={brand.typeface}
            data-flip={i % 2 === 1 || undefined}
            style={brandVars(brand.colors) as CSSProperties}
            aria-labelledby={`brand-${brand.slug}`}
          >
            <Link href={`/brands/${brand.slug}`} className={css.media} tabIndex={-1} aria-hidden="true">
              <Tilt max={4}>
                <Media media={brand.card ?? brand.hero} aspect="5 / 4" sizes="(min-width: 900px) 55vw, 100vw" hint={`${brand.name} card image`} tone="brand" reveal />
              </Tilt>
            </Link>
            <div className={css.body}>
              <div className={css.meta}>
                <span className={css.index}>{String(i + 1).padStart(2, "0")}</span>
                <OwnershipLabel ownership={brand.ownership} />
              </div>
              <h2 id={`brand-${brand.slug}`} className={css.name}>
                <Link href={`/brands/${brand.slug}`}>
                  {brand.logo ? (
                    <>
                      <span className="sr-only">{brand.name}</span>
                      <Image
                        src={brand.logo.url}
                        alt=""
                        width={brand.logo.width ?? 600}
                        height={brand.logo.height ?? 240}
                        className={css.logo}
                        unoptimized={brand.logo.mimeType === "image/svg+xml"}
                      />
                    </>
                  ) : (
                    brand.name
                  )}
                </Link>
              </h2>
              <Reveal>
                <CmsText as="p" value={brand.positioning} className={css.positioning} />
              </Reveal>
              {fp.stores > 0 && (
                <p className={css.count}>
                  <strong>{fp.stores}</strong> {fp.stores === 1 ? "store" : "stores"} · {fp.cities} {fp.cities === 1 ? "city" : "cities"}
                </p>
              )}
              <ul role="list" className={css.quick}>
                <li>
                  <Link href={`/brands/${brand.slug}#menu`}>
                    View menu <Icon name="arrow" size={16} />
                  </Link>
                </li>
                <li>
                  <Link href={`/stores?brand=${brand.slug}`}>
                    Find a store <Icon name="arrow" size={16} />
                  </Link>
                </li>
                {brand.features.investment && (
                  <li>
                    <Link href={`/brands/${brand.slug}#invest`}>
                      Enquire to invest <Icon name="arrow" size={16} />
                    </Link>
                  </li>
                )}
              </ul>
              <ButtonLink href={`/brands/${brand.slug}`} tone="brand">
                {`Explore ${brand.name}`}
              </ButtonLink>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export async function BrandCompareSection({ section }: SectionProps) {
  const [brands, stores] = await Promise.all([getBrands(), getStores()]);
  if (brands.length < 2) return null;
  const cities = (id: string) => footprintOf(stores.filter((s) => s.brand.id === id)).cities;
  const css = brandsCss;
  return (
    <Band tone={tone(section, "cream")} labelledBy={titleId(section)}>
      <Container>
        <SectionHead id={titleId(section)} eyebrow={section.eyebrow} heading={section.heading} size="md" />
        <div className={css.tableWrap} role="region" aria-labelledby={titleId(section)} tabIndex={0}>
          <table className={css.table}>
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Attribute</span>
                </th>
                {brands.map((b) => (
                  <th key={b.id} scope="col" style={{ "--c": b.colors.primary } as CSSProperties}>
                    {b.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Model</th>
                {brands.map((b) => (
                  <td key={b.id}>{b.ownership === "homegrown" ? "Homegrown" : "Franchise"}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Format</th>
                {brands.map((b) => (
                  <td key={b.id}>{present(b.formatSummary) ?? "—"}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Ticket size</th>
                {brands.map((b) => (
                  <td key={b.id}>{present(b.ticketSizeLabel) ?? (b.features.investment ? "On request" : "—")}</td>
                ))}
              </tr>
              <tr>
                <th scope="row">Cities present</th>
                {brands.map((b) => (
                  <td key={b.id}>{cities(b.id) || "—"}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Container>
    </Band>
  );
}

/* ==================================================================== Invest */

export async function OwnershipModelSection({ section, index }: SectionProps) {
  // Investor-facing: only brands open to investment (the brand's "Investment / franchise block" switch).
  const brands = (await getBrands()).filter((b) => b.features.investment);
  const css = investCss;
  return (
    <Band tone={tone(section, "paper")} labelledBy={titleId(section)}>
      <Container className={css.model}>
        <SectionHead id={titleId(section)} index={index} eyebrow={section.eyebrow} heading={section.heading} layout="stack" />
        <div className={css.modelBody}>
          {paragraphs(section.body).map((p, i) => (
            <Reveal key={i} index={i}>
              <CmsText as="p" value={p} />
            </Reveal>
          ))}
          <ul role="list" className={css.modelBrands}>
            {brands.map((b) => (
              <li key={b.id} style={{ "--c": b.colors.primary } as CSSProperties}>
                <span>{b.name}</span>
                <span className={css.modelTag}>{b.ownership === "homegrown" ? "Homegrown" : "Franchise"}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Band>
  );
}

export async function BrandInvestLinksSection({ section, index }: SectionProps) {
  const brands = (await getBrands()).filter((b) => b.features.investment);
  if (brands.length === 0) return null;
  const css = investCss;
  return (
    <Band tone={tone(section, "paper")} labelledBy={titleId(section)} spacing="tight">
      <Container>
        <SectionHead id={titleId(section)} index={index} eyebrow={section.eyebrow} heading={section.heading} body={section.body} size="md" />
        <ul role="list" className={css.brandLinks}>
          {brands.map((b) => (
            <li key={b.id} style={{ "--c": b.colors.primary } as CSSProperties} data-typeface={b.typeface}>
              <Tilt max={5}>
              <Link href={`/brands/${b.slug}#invest`} className={css.brandLink}>
                {b.card && (
                  <span className={css.brandLinkMedia} aria-hidden="true">
                    <Media media={b.card} sizes="(min-width: 720px) 50vw, 100vw" />
                  </span>
                )}
                <span className={css.brandLinkName}>{b.name}</span>
                <span className={css.brandLinkMeta}>{present(b.formatSummary) ?? "Franchise opportunity"}</span>
                <Icon name="arrow-up-right" size={28} />
              </Link>
              </Tilt>
            </li>
          ))}
        </ul>
      </Container>
    </Band>
  );
}

export function InvestorFormSection({ section }: SectionProps) {
  const css = investCss;
  return (
    <section className={css.enquiry} aria-labelledby={titleId(section)}>
      <Container className={css.enquiryGrid}>
        <SectionHead id={titleId(section)} eyebrow={section.eyebrow} heading={section.heading} body={section.body} layout="stack" />
        <InvestorForm tone="dark" />
      </Container>
    </section>
  );
}

/* ==================================================================== Stores */

export async function StoreLocatorSection({ ctx }: Props) {
  const [brands, stores] = await Promise.all([getBrands(), getStores()]);
  const brand = param(ctx.searchParams.brand);
  return (
    <section style={{ paddingBottom: "var(--space-section)" }} aria-labelledby="store-locator-heading">
      <Container>
        {/* Keeps the outline h1 → h2 → h3 (city groups) on the standalone locator page. */}
        <h2 id="store-locator-heading" className="sr-only">
          Store locator
        </h2>
        <StoreLocator
          stores={stores}
          brands={brands.map((b) => ({ slug: b.slug, name: b.name, color: b.colors.primary }))}
          initialBrand={brands.some((b) => b.slug === brand) ? brand : null}
          initialState={param(ctx.searchParams.state)}
          initialCity={param(ctx.searchParams.city)}
          syncUrl
        />
      </Container>
    </section>
  );
}

/* ===================================================================== About */

export async function MilestonesSection({ section, index }: SectionProps) {
  const milestones = await getMilestones();
  if (milestones.length === 0) return null;
  const css = aboutCss;
  return (
    <Band tone={tone(section, "cream")} labelledBy={titleId(section)} className={css.timelineBand}>
      <Container>
        {/* Open-ended: each new milestone added in Admin extends the track (and the pinned scroll). */}
        <PinnedScroll
          className={css.timelinePin}
          stickyClassName={css.timelineSticky}
          trackClassName={css.timeline}
          label={section.heading ?? "Milestones"}
          head={<SectionHead id={titleId(section)} index={index} eyebrow={section.eyebrow} heading={section.heading} />}
        >
          {milestones.map((m, i) => (
            <li key={m.id} className={css.milestone} data-reveal="up" style={{ "--i": i % 4 } as CSSProperties}>
              <p className={css.year}>{m.yearLabel}</p>
              {m.media && <Media media={m.media} aspect="3 / 2" sizes="(min-width: 900px) 25vw, 80vw" className={css.milestoneMedia} />}
              <div className={css.milestoneBody}>
                <h3 className={css.milestoneTitle}>
                  <CmsText value={m.title} />
                </h3>
                <CmsText as="p" value={m.body} />
              </div>
            </li>
          ))}
          <li className={`${css.milestone} ${css.milestoneNext}`} aria-hidden="true">
            <p className={css.year}>Next</p>
            <p className={css.milestoneTitle}>{present(section.subheading) ?? "The story continues."}</p>
          </li>
        </PinnedScroll>
      </Container>
    </Band>
  );
}

export async function PeopleSection({ section, index, kind }: SectionProps & { kind: "founder" | "leader" }) {
  const people = await getPeople(kind);
  if (people.length === 0) return null;
  const css = aboutCss;
  return (
    <Band tone={tone(section, kind === "founder" ? "paper" : "cream")} labelledBy={titleId(section)}>
      <Container>
        <SectionHead id={titleId(section)} index={index} eyebrow={section.eyebrow} heading={section.heading} body={section.body} size={kind === "leader" ? "md" : "lg"} />
        <div className={kind === "founder" ? css.founders : css.leaders}>
          {people.map((p, i) => (
            <PersonCard key={p.id} person={p} index={i % 4} detailed={kind === "founder"} />
          ))}
        </div>
      </Container>
    </Band>
  );
}

/* ======================================================================= CSR */

const dateFormat = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });

export async function CsrInitiativesSection({ section, index }: SectionProps) {
  const initiatives = await getCsrInitiatives();
  if (initiatives.length === 0) return null;
  const css = csrCss;
  return (
    <Band tone={tone(section, "cream")} labelledBy={titleId(section)}>
      <Container>
        <SectionHead id={titleId(section)} index={index} eyebrow={section.eyebrow} heading={section.heading} body={section.body} />
        <div className={css.initiatives}>
          {initiatives.map((item, i) => (
            <article key={item.id} className={css.initiative} data-flip={i % 2 === 1 || undefined} aria-labelledby={`init-${item.id}`}>
              <div className={css.photos} data-count={Math.min(item.photos.length, 3) || 1}>
                {(item.photos.length ? item.photos.slice(0, 3) : [null]).map((p, j) => (
                  <Media key={p?.id ?? j} media={p?.media} aspect={j === 0 ? "4 / 5" : "1 / 1"} sizes="(min-width: 900px) 30vw, 90vw" reveal hint="Initiative photo" className={css.photo} />
                ))}
              </div>
              <div className={css.initiativeText}>
                <p className={css.initiativeMeta}>
                  {item.location && (
                    <span>
                      <Icon name="pin" size={16} /> {item.location}
                    </span>
                  )}
                  {item.eventDate && <time dateTime={item.eventDate}>{dateFormat.format(new Date(item.eventDate))}</time>}
                </p>
                <h3 id={`init-${item.id}`} className={css.initiativeTitle}>
                  {item.title}
                </h3>
                {paragraphs(item.description).map((p, j) => (
                  <CmsText key={j} as="p" value={p} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Band>
  );
}

export async function CsrGallerySection({ section, index }: SectionProps) {
  const [gallery, initiatives] = await Promise.all([getGallery("csr"), getCsrInitiatives()]);
  // Initiative photos are also `csr` gallery rows, so merge by id to avoid duplicates.
  const photos = [...new Map([...gallery, ...initiatives.flatMap((i) => i.photos)].map((p) => [p.id, p])).values()];
  if (photos.length === 0) return null;
  return (
    <Band tone={tone(section, "paper")} labelledBy={titleId(section)}>
      <Container>
        <SectionHead id={titleId(section)} index={index} eyebrow={section.eyebrow} heading={section.heading} size="md" />
        <Gallery items={photos} label="CSR photo gallery" />
      </Container>
    </Band>
  );
}

export function CsrFormSection({ section }: SectionProps) {
  const css = csrCss;
  return (
    <section className={css.partner} aria-labelledby={titleId(section)} style={{ "--brand": "var(--saffron)", "--brand-text": "var(--saffron)" } as CSSProperties}>
      <Container className={css.partnerGrid}>
        <SectionHead id={titleId(section)} eyebrow={section.eyebrow} heading={section.heading} body={section.body} layout="stack" />
        <GeneralForm tone="dark" fixedType="CSR partnership" submitLabel="Send proposal" />
      </Container>
    </section>
  );
}

/* =================================================================== Careers */

export async function CareersGallerySection({ section, index }: SectionProps) {
  const life = await getGallery("careers");
  if (life.length === 0) return null;
  return (
    <Band tone={tone(section, "paper")} labelledBy={titleId(section)}>
      <Container>
        <SectionHead id={titleId(section)} index={index} eyebrow={section.eyebrow} heading={section.heading} body={section.body} size="md" />
        <Gallery items={life} label="Life at Litensity" />
      </Container>
    </Band>
  );
}

type JobFilterKey = "brand" | "city" | "type";

const JOB_FILTERS: { key: JobFilterKey; label: string; all: string; value: (j: Awaited<ReturnType<typeof getOpenJobs>>[number]) => string | null }[] = [
  { key: "brand", label: "Brand", all: "All brands", value: (j) => j.brandName },
  { key: "city", label: "Location", all: "All locations", value: (j) => j.location },
  { key: "type", label: "Type", all: "All types", value: (j) => j.employmentType },
];

/** Open roles, filterable by brand, location and type (brief p.25: "views open roles by brand, city and type"). */
export async function JobListSection({ section, index, ctx }: Props) {
  const allJobs = await getOpenJobs();
  const css = careersCss;
  const active = Object.fromEntries(JOB_FILTERS.map((f) => [f.key, param(ctx.searchParams[f.key])])) as Record<JobFilterKey, string | null>;
  const jobs = allJobs.filter((j) => JOB_FILTERS.every((f) => !active[f.key] || f.value(j) === active[f.key]));
  // Only offer a filter where there is an actual choice to make.
  const filters = JOB_FILTERS.map((f) => ({
    ...f,
    options: [...new Set(allJobs.map(f.value).filter((v): v is string => Boolean(v)))].sort((a, b) => a.localeCompare(b)),
  })).filter((f) => f.options.length > 1);
  const hrefWith = (key: JobFilterKey, value: string | null) => {
    const params = new URLSearchParams();
    for (const f of JOB_FILTERS) {
      const v = f.key === key ? value : active[f.key];
      if (v) params.set(f.key, v);
    }
    const qs = params.toString();
    return `/careers${qs ? `?${qs}` : ""}#${section.key}`;
  };
  return (
    <Band tone={tone(section, "paper")} labelledBy={titleId(section)}>
      <Container>
        <SectionHead id={titleId(section)} index={index} eyebrow={section.eyebrow} heading={section.heading} body={section.body} />
        {filters.length > 0 && (
          <div className={css.jobFilters}>
            {filters.map((f) => (
              <nav key={f.key} className={css.jobFilter} aria-label={`Filter roles by ${f.label.toLowerCase()}`}>
                <span className="label">{f.label}</span>
                <ul role="list">
                  {[null, ...f.options].map((option) => (
                    <li key={option ?? "all"}>
                      <Link href={hrefWith(f.key, option)} scroll={false} aria-current={active[f.key] === option ? "true" : undefined}>
                        {option ?? f.all}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <p className={css.jobCount} aria-live="polite">
              <strong>{jobs.length}</strong> of {allJobs.length} {allJobs.length === 1 ? "role" : "roles"}
            </p>
          </div>
        )}
        {jobs.length > 0 ? (
          <Accordion
            name="roles"
            items={jobs.map((job) => ({
              id: job.id,
              title: job.title,
              meta: (
                <span className={css.jobMeta}>
                  {job.brandName && <span>{job.brandName}</span>}
                  <span>{job.location}</span>
                  <span>{job.employmentType}</span>
                </span>
              ),
              content: (
                <div className={css.jobBody}>
                  <CmsText as="p" value={job.summary} className={css.jobSummary} />
                  {paragraphs(job.description).map((p, i) => (
                    <CmsText key={i} as="p" value={p} />
                  ))}
                  {job.requirements && (
                    <>
                      <p className="label">Requirements</p>
                      {paragraphs(job.requirements).map((p, i) => (
                        <CmsText key={i} as="p" value={p} />
                      ))}
                    </>
                  )}
                  <Link href={`/careers/${job.id}`} className={css.apply}>
                    Apply for this role <Icon name="arrow" size={18} />
                  </Link>
                </div>
              ),
            }))}
          />
        ) : (
          <p className={css.noRoles}>
            {allJobs.length > 0
              ? "No open roles match those filters — try another option, or send a general application below."
              : "There are no open roles right now — send a general application below."}
          </p>
        )}
      </Container>
    </Band>
  );
}

/** General application (PRD §12) for candidates with no matching role. Role applications live on /careers/[id]. */
export async function CareerFormSection({ section }: Props) {
  const [jobs, brands] = await Promise.all([getOpenJobs(), getBrands()]);
  const css = careersCss;
  return (
    <section className={css.applySection} aria-labelledby={titleId(section)}>
      <Container className={css.applyGrid}>
        <div>
          <SectionHead id={titleId(section)} eyebrow={section.eyebrow} heading={section.heading} body={section.body} layout="stack" />
        </div>
        <CareerForm
          tone="dark"
          roles={jobs.map((j) => j.title)}
          brands={brands.map((b) => ({ label: b.name, value: b.slug }))}
        />
      </Container>
    </section>
  );
}

/* =================================================================== Contact */

export async function ContactHqSection({ section }: SectionProps) {
  const settings = await getSiteSettings();
  const css = contactCss;
  const mapHref =
    settings.mapUrl ??
    (settings.latitude && settings.longitude ? `https://www.google.com/maps/search/?api=1&query=${settings.latitude},${settings.longitude}` : null);
  return (
    <Band tone="paper" spacing="tight" labelledBy={titleId(section)}>
      <Container className={css.hq}>
        <div className={css.hqMain}>
          <p className="label">{section.eyebrow}</p>
          <h2 id={titleId(section)} className={css.hqName}>
            {present(settings.legalName) ?? settings.companyName}
          </h2>
          <CmsText as="address" value={settings.address} className={css.address} />
          {mapHref && (
            <a href={mapHref} target="_blank" rel="noopener noreferrer" className={css.mapLink}>
              <Icon name="directions" size={18} /> Open in Maps
            </a>
          )}
        </div>
        {settings.latitude !== null && settings.longitude !== null && (
          <div className={css.officeMap}>
            <OfficeMap
              lat={settings.latitude}
              lng={settings.longitude}
              title={present(settings.legalName) ?? settings.companyName}
              subtitle={present(settings.address)?.split(/\r?\n/)[0] ?? ""}
            />
          </div>
        )}
        <ul role="list" className={css.channels}>
          {settings.phone && (
            <li>
              <a href={telHref(settings.phone)}>
                <Icon name="phone" size={22} />
                <span className="label">Call</span>
                <span className={css.channelValue}>{settings.phone}</span>
              </a>
            </li>
          )}
          {settings.email && (
            <li>
              <a href={`mailto:${settings.email}`}>
                <Icon name="mail" size={22} />
                <span className="label">Email</span>
                <span className={css.channelValue}>{settings.email}</span>
              </a>
            </li>
          )}
          {settings.whatsappNumber && (
            <li>
              <a href={whatsappHref(settings.whatsappNumber, settings.whatsappMessage)} target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" size={22} />
                <span className="label">WhatsApp</span>
                <span className={css.channelValue}>Chat with us</span>
              </a>
            </li>
          )}
        </ul>
      </Container>
    </Band>
  );
}

export async function DepartmentsSection({ section, index }: SectionProps) {
  const departments = await getContactDepartments();
  if (departments.length === 0) return null;
  const css = contactCss;
  return (
    <Band tone={tone(section, "cream")} labelledBy={titleId(section)}>
      <Container>
        <SectionHead id={titleId(section)} index={index} eyebrow={section.eyebrow} heading={section.heading} body={section.body} size="md" />
        <ul role="list" className={css.departments}>
          {departments.map((d, i) => (
            <li key={d.id} className={css.department} data-reveal="up" style={{ "--i": i % 4 } as CSSProperties}>
              <h3 className={css.deptName}>{d.name}</h3>
              <CmsText as="p" value={d.description} className={css.deptDesc} />
              <div className={css.deptLinks}>
                {d.email && <a href={`mailto:${d.email}`}>{d.email}</a>}
                {d.phone && <a href={telHref(d.phone)}>{d.phone}</a>}
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Band>
  );
}

export function ContactFormSection({ section }: SectionProps) {
  const css = contactCss;
  const shortcuts = section.items.filter((r) => r.href);
  return (
    <section className={css.formSection} aria-labelledby={titleId(section)}>
      <Container className={css.formGrid}>
        <div className={css.formSide}>
          <SectionHead id={titleId(section)} eyebrow={section.eyebrow} heading={section.heading} body={section.body} layout="stack" />
          {shortcuts.length > 0 && (
            <nav aria-label={section.subheading ?? "Shortcuts"} className={css.routing}>
              <p className="label">{section.subheading}</p>
              <ul role="list">
                {shortcuts.map((r) => (
                  <li key={r.id}>
                    <Link href={r.href!}>
                      <span>
                        <strong>{r.title}</strong>
                        <CmsText as="span" value={r.body} />
                      </span>
                      <Icon name="arrow" size={18} />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
        <GeneralForm tone="dark" />
      </Container>
    </section>
  );
}
