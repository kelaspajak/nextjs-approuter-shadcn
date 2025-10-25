"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/cn";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const listVariant = {
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
  hidden: {
    opacity: 0,
  },
};

const itemVariant = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Peraturan", href: "/#peraturan" },
  { label: "Akuntansi", href: "/#akuntansi" },
  { label: "Blog", href: "/#blog" },
  { label: "Tanya Jawab", href: "/#tanya-jawab" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    const setPixelRatio = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      document.documentElement.style.setProperty(
        "--pixel-ratio",
        `${1 / pixelRatio}`
      );
    };

    setPixelRatio();
    window.addEventListener("resize", setPixelRatio);

    return () => window.removeEventListener("resize", setPixelRatio);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleToggleMenu = () => setOpen((prev) => !prev);

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {}
  };

  const getIsActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    if (!href.startsWith("/") || href.includes("#")) {
      return false;
    }

    return pathname.startsWith(href);
  };

  if (pathname.includes("pitch")) {
    return null;
  }

  return (
    <header className="sticky top-4 z-50 mt-4 flex justify-center px-2 md:px-4">
      <nav className="relative z-20 flex h-[50px] items-center border border-border bg-[#FFFFFF] bg-opacity-70 px-4 backdrop-blur-xl backdrop-filter dark:bg-[#121212]">
        <ContextMenu>
          <ContextMenuTrigger>
            <Link href="/">
              <span className="relative z-10 px-[0.3rem] py-[0.2rem] font-mono text-sm text-primary-foreground before:pointer-events-none before:absolute before:-inset-x-1 before:inset-y-0 before:-z-10 before:-rotate-1 before:rounded-xs before:bg-primary">
                Diskusi Pajak
              </span>
            </Link>
          </ContextMenuTrigger>

          <ContextMenuContent
            alignOffset={20}
            className="w-[220px] rounded-none bg-[#fff] dark:bg-[#121212]"
          >
            <div className="space-y-1">
              <ContextMenuItem
                className="flex items-center space-x-2"
                onClick={() => copyToClipboard("Diskusi Pajak")}
              >
                <Icons.Copy className="size-3" />
                <span className="text-sm font-medium">Salin nama brand</span>
              </ContextMenuItem>
              <ContextMenuItem
                className="flex items-center space-x-2"
                onClick={() =>
                  copyToClipboard(
                    "Rujukan perpajakan, akuntansi, dan diskusi profesional dalam satu platform."
                  )
                }
              >
                <Icons.Description className="size-3" />
                <span className="text-sm font-medium">Salin tagline</span>
              </ContextMenuItem>
              <ContextMenuItem asChild>
                <a
                  className="flex items-center space-x-2"
                  href="https://diskusipajak.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icons.ExternalLink className="size-3" />
                  <span className="text-sm font-medium">Buka situs utama</span>
                </a>
              </ContextMenuItem>
            </div>
          </ContextMenuContent>
        </ContextMenu>

        <ul className="mx-3 hidden space-x-2 text-sm font-medium md:flex">
          {navLinks.map(({ href, label }) => {
            const isActive = getIsActive(href);

            return (
              <li key={href}>
                <Link
                  className={cn(
                    "inline-flex h-8 items-center justify-center px-3 py-2 text-secondary-foreground transition-opacity duration-200 hover:opacity-70",
                    isActive && "text-primary"
                  )}
                  href={href}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          className="ml-auto p-2 md:hidden"
          type="button"
          onClick={handleToggleMenu}
        >
          <svg fill="none" height={13} width={18} xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 12.195v-2.007h18v2.007H0Zm0-5.017V5.172h18v2.006H0Zm0-5.016V.155h18v2.007H0Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </nav>

      {isOpen && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-10 h-screen bg-background px-2"
          initial={{ opacity: 0 }}
        >
          <div className="relative ml-[1px] mt-4 flex justify-between px-4 py-3">
            <button type="button" onClick={handleToggleMenu}>
              <span className="sr-only">Diskusi Pajak</span>
              <Icons.LogoSmall />
            </button>

            <button
              className="absolute right-[10px] top-2 p-2 md:hidden"
              type="button"
              onClick={handleToggleMenu}
            >
              <svg className="fill-primary" height={24} width={24} xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
              </svg>
            </button>
          </div>

          <div className="h-screen overflow-auto pb-[150px]">
            <motion.ul
              animate="show"
              className="mb-8 space-y-8 px-3 pt-8 text-xl text-[#878787]"
              initial="hidden"
              variants={listVariant}
            >
              {navLinks.map(({ href, label }) => (
                <motion.li key={href} variants={itemVariant}>
                  <Link
                    className={cn(
                      getIsActive(href) && "text-primary"
                    )}
                    href={href}
                    onClick={handleToggleMenu}
                  >
                    {label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </motion.div>
      )}
    </header>
  );
}
