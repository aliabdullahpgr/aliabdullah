import "~/styles/globals.css";

import { type Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

export const metadata: Metadata = {
  title: "Ali Abdullah — Software Engineer",
  description:
    "Software Engineer in Multan, Pakistan. Building systems with design and purpose.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        {children}
      </body>
    </html>
  );
}
