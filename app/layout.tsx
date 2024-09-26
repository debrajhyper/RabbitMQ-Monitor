import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Geist Sans is the primary font used in the app, for titles, headings, and body text.
// It's a variable font, so we can use the same font file for all weights.
const geistSans = localFont({
  // The font file is located in the `fonts` directory.
  src: "./fonts/GeistVF.woff",
  // The variable name is used to inject the font into the CSS.
  variable: "--font-geist-sans",
  // The font weights are specified as a range from 100 to 900.
  weight: "100 900",
});

// Geist Mono is a monospace font used in the app for code blocks and other preformatted text.
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// The metadata is used to set the title and description of the app.
export const metadata: Metadata = {
  title: 'RabbitMQ Monitor',
  description: 'Monitor RabbitMQ messages',
};

// The RootLayout component is the top-level component that wraps the app.
// It sets the font families for the entire app.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // The `suppressHydrationWarning` prop is used to suppress a warning about hydration.
        // This is necessary because we're using a variable font, which is not supported by Next.js.
        suppressHydrationWarning
        // The font families are set using the `className` prop.
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}