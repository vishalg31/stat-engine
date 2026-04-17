import "./globals.css";
import HubHeader from "./hub-header";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "IPL Stat Engine",
  description: "Local IPL stat explorer and battle engine."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <HubHeader />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
