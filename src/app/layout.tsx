import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header/Header";
import SupportChat from "./components/SupportChat/SupportChat";
import { ClerkProvider } from '@clerk/nextjs';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Кристалл Авто - Премиальная автомойка",
  description: "Профессиональный уход за вашим автомобилем",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ru">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <Header />
          {children}
          <SupportChat />
        </body>
      </html>
    </ClerkProvider>
  );
}
