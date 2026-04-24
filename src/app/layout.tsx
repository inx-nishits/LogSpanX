import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { AppBootstrap } from "@/components/app-bootstrap";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LogSpanX - Time Tracking",
  description: "Track your time seamlessly with LogSpanX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${roboto.variable} h-full`}
    >
      <body className={`${roboto.className} min-h-full flex flex-col`} suppressHydrationWarning>
        <AppBootstrap />
        {children}
      </body>
    </html>
  );
}
