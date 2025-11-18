import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Schema & Ontology Registry",
  description: "A centralized registry for managing and versioning JSON Schemas, OpenAPI specifications, and glossary terms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
