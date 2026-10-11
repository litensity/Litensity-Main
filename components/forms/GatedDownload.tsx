import type { ComponentProps } from "react";
import { getFormOptions } from "@/lib/cms/site";
import { present } from "@/lib/content";
import { DownloadGateClient } from "./DownloadGate";

const DEFAULT_CONSENT = "I agree to be contacted by Litensity about this request and accept the Privacy Policy.";

/** Server wrapper: supplies the CMS consent wording to the OTP download gate. */
export async function DownloadGate(props: Omit<ComponentProps<typeof DownloadGateClient>, "consentLabel">) {
  const options = await getFormOptions("downloads");
  return <DownloadGateClient {...props} consentLabel={present(options.consentLabel) ?? DEFAULT_CONSENT} />;
}
