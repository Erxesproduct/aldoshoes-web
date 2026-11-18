import { Commissioner, Fira_Sans_Extra_Condensed } from "next/font/google";

// Both carry Mongolian Ө ө Ү ү (checked against the Google Fonts cmap).
/** Runway headlines: tall, condensed, uppercase. */
export const display = Fira_Sans_Extra_Condensed({ subsets: ["latin", "cyrillic", "cyrillic-ext"], weight: ["500", "700", "800", "900"], variable: "--nf-display", display: "swap" });
export const sans = Commissioner({ subsets: ["latin", "cyrillic", "cyrillic-ext"], weight: ["400", "500", "600", "700"], variable: "--nf-sans", display: "swap" });
