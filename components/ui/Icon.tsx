import type { SVGProps } from "react";

const paths: Record<string, string> = {
  arrow: "M5 12h14M13 6l6 6-6 6",
  "arrow-up-right": "M7 17 17 7M8 7h9v9",
  "arrow-down": "M12 5v14M6 13l6 6 6-6",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6 6 18",
  menu: "M4 8h16M4 16h16",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  whatsapp:
    "M3.5 20.5 5 16a8.5 8.5 0 1 1 3 3l-4.5 1.5ZM9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8A5 5 0 0 1 11 10.8l.8-1-1-2L9 8.5Z",
  pin: "M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2",
  directions: "M12 2 22 12 12 22 2 12 12 2Zm-2 13v-3h4.5M12 9.5l2.5 2.5L12 14.5",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-4-4",
  locate: "M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm0-4a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0-13v3m0 14v3M2 12h3m14 0h3",
  layers: "M12 3 2 8l10 5 10-5-10-5ZM2 13l10 5 10-5M2 17.5l10 5 10-5",
  truck: "M2 6h12v10H2zM14 10h4l4 3v3h-8M6.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  megaphone: "M3 10v4h3l7 4V6L6 10H3Zm13-1.5a4 4 0 0 1 0 7M19 6a8 8 0 0 1 0 12",
  users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14a6 6 0 0 1 3 6",
  chef: "M7 14v6h10v-6M7 14a4 4 0 0 1-1-7.8A4.5 4.5 0 0 1 12 4a4.5 4.5 0 0 1 6 2.2A4 4 0 0 1 17 14H7Zm0 3h10",
  gauge: "M4 17a8 8 0 1 1 16 0M12 17l4-5",
  build: "M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6",
  leaf: "M5 19C5 10 10 5 20 4c-1 10-6 15-15 15Zm0 0 7-7",
  heart: "M12 20s-8-4.8-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.2 12 20 12 20Z",
  sparkle: "M12 3c.6 4.8 2.2 6.4 7 7-4.8.6-6.4 2.2-7 7-.6-4.8-2.2-6.4-7-7 4.8-.6 6.4-2.2 7-7Z",
  flame: "M12 21a6 6 0 0 0 6-6c0-4-3-6-4-10-2 2-3 4-3 6-1-1-1.5-2-1.5-3C7 10 6 12.5 6 15a6 6 0 0 0 6 6Z",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  instagram: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm5.5-9.5h.01",
  linkedin: "M4 9h4v11H4zM6 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm4 5h4v1.5c.8-1.2 2-1.8 3.5-1.8 2.5 0 3.5 1.6 3.5 4.3v6h-4v-5.5c0-1.4-.5-2-1.6-2-1.2 0-1.9.8-1.9 2.3V20h-3.5z",
  facebook: "M14 21v-8h3l.5-3.5H14V7.5c0-1 .4-1.7 1.8-1.7H18V2.6A24 24 0 0 0 15.3 2.5C12.6 2.5 10.5 4 10.5 7v2.5h-3V13h3v8",
  youtube: "M3 8.5C3 6.5 4.5 5 6.5 5h11C19.5 5 21 6.5 21 8.5v7c0 2-1.5 3.5-3.5 3.5h-11C4.5 19 3 17.5 3 15.5Zm7 .5v6l5-3Z",
  x: "M4 4l16 16M20 4 4 20",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  "eye-off": "M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9M6.3 6.3C3.6 8.1 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.5 4.5-1.2M9.9 9.9a3 3 0 0 0 4.2 4.2",
  copy: "M8 8h12v12H8zM16 8V4H4v12h4",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  grip: "M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01",
  pause: "M9 6v12M15 6v12",
  play: "M8 5.5v13l11-6.5z",
  "chevron-up": "M6 15l6-6 6 6",
  "chevron-down": "M6 9l6 6 6-6",
};

export type IconName = keyof typeof paths;

export function hasIcon(name: string | null | undefined): name is IconName {
  return !!name && name in paths;
}

export function Icon({ name, size = 20, ...rest }: { name: IconName | string; size?: number } & SVGProps<SVGSVGElement>) {
  const d = paths[name] ?? paths.sparkle;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}

export const ICON_NAMES = Object.keys(paths);
