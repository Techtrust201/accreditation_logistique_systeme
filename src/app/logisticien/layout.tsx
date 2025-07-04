"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function LogisticienLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen text-sm text-gray-900">
      {/* Burger mobile (visible seulement si sidebar fermée) */}
      {!sidebarOpen && (
        <button
          className="fixed top-4 left-4 z-[100] sm:hidden bg-[#3F4660] text-white p-3 rounded-2xl shadow-lg hover:bg-[#4F587E] transition"
          onClick={() => setSidebarOpen(true)}
          aria-label="Ouvrir le menu"
        >
          <Menu size={28} />
        </button>
      )}
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`
        fixed sm:static top-0 left-0 z-50 h-screen w-60 bg-[#3F4660] text-white flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        sm:translate-x-0 sm:flex
      `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-white/10 text-lg font-semibold">
          <svg
            width="60"
            height="24"
            viewBox="0 0 60 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path d="M9 19L15 3H21L15 19H9Z" fill="currentColor" />
          </svg>
        </div>
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
          {/* Bloc Accréditations */}
          <details open className="group">
            <summary className="flex items-center justify-between cursor-pointer px-3 py-2 bg-[#2C2F3F] text-xs font-semibold uppercase tracking-wide select-none">
              <span className="flex items-center gap-2">
                <Image
                  src="/logisticien/Vector%20(16).svg"
                  width={16}
                  height={16}
                  alt=""
                />
                Accréditations
              </span>
              <svg
                className="w-3 h-3 transition-transform group-open:rotate-180"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M6 8l4 4 4-4" />
              </svg>
            </summary>
            <ul className="mt-2 pl-5 space-y-1 text-sm">
              <li>
                <Link
                  href="/logisticien"
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10"
                >
                  <Image
                    src="/logisticien/Vector%20(17).svg"
                    width={16}
                    height={16}
                    alt=""
                  />
                  Liste
                </Link>
              </li>
              <li>
                <Link
                  href="/logisticien/nouveau?step=1"
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10"
                >
                  <Image
                    src="/logisticien/Vector%20(18).svg"
                    width={16}
                    height={16}
                    alt=""
                  />
                  Créer
                </Link>
              </li>
            </ul>
          </details>

          {/* Bloc Scans */}
          <details open className="group">
            <summary className="flex items-center justify-between cursor-pointer px-3 py-2 bg-[#2C2F3F] text-xs font-semibold uppercase tracking-wide select-none">
              <span className="flex items-center gap-2">
                <Image
                  src="/logisticien/Vector%20(19).svg"
                  width={16}
                  height={16}
                  alt=""
                />
                Scans
              </span>
              <svg
                className="w-3 h-3 transition-transform group-open:rotate-180"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M6 8l4 4 4-4" />
              </svg>
            </summary>
            <ul className="mt-2 pl-5 space-y-1 text-sm">
              <li>
                <Link
                  href="#"
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10"
                >
                  <Image
                    src="/logisticien/Group%201%20(1).svg"
                    width={16}
                    height={16}
                    alt=""
                  />
                  Plaque
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10"
                >
                  <Image
                    src="/logisticien/Vector%20(20).svg"
                    width={16}
                    height={16}
                    alt=""
                  />
                  QR code
                </Link>
              </li>
            </ul>
          </details>
        </nav>
        {/* Déconnexion */}
        <div className="border-t border-white/10 p-4 text-xs">
          <Link
            href="/logout"
            className="flex items-center gap-2 hover:underline"
          >
            <Image
              src="/logisticien/Vector%20(21).svg"
              width={16}
              height={16}
              alt=""
            />
            Se déconnecter
          </Link>
        </div>
        {/* Close button mobile (visible seulement si sidebar ouverte) */}
        {sidebarOpen && (
          <button
            className="absolute top-4 right-4 sm:hidden text-white bg-[#2C2F3F] p-2 rounded-full"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer le menu"
          >
            <X size={24} />
          </button>
        )}
      </aside>
      {/* Contenu principal */}
      <main className="flex-1 bg-gray-50 overflow-y-auto h-auto min-h-0">
        {children}
      </main>
    </div>
  );
}
