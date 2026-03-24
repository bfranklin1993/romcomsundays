"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Collection" },
    { href: "/suggest", label: "Suggest" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="bg-brand px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="font-damion text-2xl text-white">
          Rom Com Sundays
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-6 text-base font-bold">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "text-white"
                  : "text-white/70 hover:text-white transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white text-xl"
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 text-base font-bold">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={
                pathname === link.href
                  ? "text-white"
                  : "text-white/70 hover:text-white transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
