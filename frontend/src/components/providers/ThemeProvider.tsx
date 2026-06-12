"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#1D1B15",
            color: "#EAE0CB",
            border: "1.5px solid #272319",
            borderRadius: "0",
            fontSize: "0.78rem",
            fontFamily: "'Syne Mono', monospace",
            letterSpacing: "0.04em",
            boxShadow: "4px 4px 0px #272319",
            padding: "12px 16px",
          },
          success: {
            iconTheme: { primary: "#F0A520", secondary: "#0E0D0A" },
          },
          error: {
            iconTheme: { primary: "#C84020", secondary: "#F6F1E7" },
          },
        }}
      />
      {children}
    </NextThemeProvider>
  );
}
