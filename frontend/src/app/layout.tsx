import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "../components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "OpenWork AI — Document Intelligence Platform",
  description:
    "Chat with your documents using AI. Upload PDFs, ask questions, get instant answers from your own knowledge base.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
