import './globals.css'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { cn } from '@/lib/cn';

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Ghost CMS Blog",
	description: "Latest stories sourced directly from Ghost CMS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          `${geistSans.variable} ${geistMono.variable}`,
          "bg-[#fbfbfb] dark:bg-[#0C0C0C] overflow-x-hidden font-sans antialiased",
        )}
      >
				 <Navbar />
      {/* <body className={`${inter.className} dark custom-bg`}> */}
        {children}</body>
    </html>
  )
}
