import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lc-calendar-pi.vercel.app'),
  title: "L&C Calendar — Calendario para Parejas",
  description: "Organización y sincronización de planes para el día a día en pareja sin fricción.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.png" },
      { url: "/icon.png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "L&C Calendar",
  },
  openGraph: {
    title: "L&C Calendar",
    description: "Calendario visual y minimalista para parejas.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "L&C Calendar 3D Logo" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-neutral-100 text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
