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
    <nav className="px-6 py-4 border-b-2 border-divider">
      <div className="flex items-center justify-between">
        <Link href="/" className="font-damion text-2xl text-brand">
          Rom Com Sundays
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-5 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "text-brand font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-text-secondary text-xl"
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={
                pathname === link.href
                  ? "text-brand font-semibold"
                  : "text-text-secondary hover:text-text-primary"
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
