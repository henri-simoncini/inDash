import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Aponta direto para --font-sans, a variável que o tema (shadcn) consome
const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "inDash",
  description: "Dashboard de gestão para freelancers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Anti-flash: aplica tema/fonte do cookie antes da primeira pintura */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|; )indash-prefs=([^;]*)/);if(!m)return;var p=JSON.parse(decodeURIComponent(m[1]));var h=document.documentElement;var dark=p.theme==="dark"||(p.theme==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);h.classList.toggle("dark",dark);if(p.fontSize&&p.fontSize!=="md")h.setAttribute("data-font-size",p.fontSize);if(p.font&&p.font!=="sans")h.setAttribute("data-font",p.font);if(p.highContrast)h.setAttribute("data-contrast","high")}catch(e){}})();`,
          }}
        />
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
