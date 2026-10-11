/**
 * Which part of the page a form or download was used from (brief p.24: "which page and
 * section the enquiry came from"). Section wrappers carry `data-source-section`.
 */
export function sourceSectionOf(el: Element | null): string {
  return el?.closest("[data-source-section]")?.getAttribute("data-source-section") ?? "";
}
