import type { Metadata } from "next";
import "./globals.css";
import "../App.css";
import { jameelNoori } from "./fonts";
import ResponsiveNav from "./components/nav/ResponsiveNav";
import Footer from "./footer/Footer";
import { Toaster } from "react-hot-toast";  

export const metadata: Metadata = {
  title: "Sanjeeda.io",
  description: "Sanjeeda website",
  icons: {
    icon: "/sanjeeda-logo.png",
    shortcut: "/sanjeeda-logo.png",
    apple: "/sanjeeda-logo.png",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};
import { Analytics } from "@vercel/analytics/next"
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <html lang="en" className="h-full w-full">
 
      <body className={`${jameelNoori.variable} antialiased min-h-screen w-full overflow-x-hidden`}>
        <ResponsiveNav/>        
        {children}
        <Analytics />
        <Footer/>
        <Toaster/>
      </body>
    </html>
  );
}