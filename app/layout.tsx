import type { Metadata } from "next";
import "./globals.css";
import { Aurora, Iridescence } from "@/components/ui";
import { AudioProvider } from "@/contexts/AudioContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

const BASE_URL = "https://starlightquran.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Starlight Quran",
    template: "%s | Starlight Quran",
  },
  description: "اقرأ القرآن الكريم بتجربة روحانية فريدة – استمع للتلاوات، تعلّم الأذكار والأدعية، ",
  keywords: [
    "قرآن كريم", "quran", "تلاوة", "recitation", "دعاء", "duas",
    "أذكار", "adhkar", "أوقات الصلاة", "prayer times", "إسلام", "islam",
    "تفسير", "tafsir", "سور القرآن", "quran surahs", "islamic app",
    "تطبيق إسلامي", "StarLight Quran", "starlightquran",
  ],
  authors: [{ name: "OsamaFed", url: BASE_URL }],
  creator: "OsamaFed",
  publisher: "OsamaFed",
  generator: "Next.js",
  applicationName: "Starlight Quran",
  referrer: "origin-when-cross-origin",
  category: "religion",
  alternates: {
    canonical: "/",
    languages: { "ar-SA": "/", "en-US": "/en" },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Starlight Quran 🌠",
    description: "اقرأ القرآن الكريم بتجربة روحانية فريدة – استمع للتلاوات، تعلّم الأذكار والأدعية، واطّلع على أوقات الصلاة.",
    url: BASE_URL,
    siteName: "Starlight Quran",
    type: "website",
    locale: "ar_SA",
    alternateLocale: ["en_US"],
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Starlight Quran 🌠", type: "image/png" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@OsamaFed",
    creator: "@OsamaFed",
    title: "Starlight Quran",
    description: "اقرأ القرآن الكريم بتجربة روحانية فريدة – استمع للتلاوات، تعلّم الأذكار والأدعية.",
    images: ["/og-image.png"],
  },
      icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#0a0a12" }], 
  },
  appleWebApp: {
    capable: true,
    title: "Starlight Quran",
    statusBarStyle: "black-translucent",
  },
  manifest: "/manifest.json",
  other: {
    google: "notranslate",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#0a0a12",
    "theme-color": "#0a0a12",
  },

};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <body>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Starlight Quran",
              url: BASE_URL,
              description: "اقرأ القرآن الكريم بتجربة روحانية فريدة",
              inLanguage: "ar",
              potentialAction: {
                "@type": "SearchAction",
                target: `${BASE_URL}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <AudioProvider>
          <div className="aurorabg">
            <Aurora blend={0.2} amplitude={1.0} speed={0.4} />
          </div>
          <div className="iridescencebg">
            <Iridescence color={[0.5, 0.6, 0.8]} mouseReact amplitude={0.1} speed={0.1} />
          </div>
          {children}
        </AudioProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
