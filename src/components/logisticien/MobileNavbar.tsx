import Link from "next/link";
import { Menu, Home, Plus } from "lucide-react";

export default function MobileNavbar({ onBurger }: { onBurger?: () => void }) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-200 shadow-lg flex justify-around items-center h-16 block sm:hidden">
      <button
        onClick={onBurger}
        className="flex flex-col items-center justify-center text-[#4F587E] hover:text-[#3B4252] focus:outline-none"
        aria-label="Ouvrir le menu"
      >
        <Menu size={28} />
        <span className="text-xs mt-1">Menu</span>
      </button>
      <Link
        href="/logisticien"
        className="flex flex-col items-center justify-center text-[#4F587E] hover:text-[#3B4252]"
      >
        <Home size={26} />
        <span className="text-xs mt-1">Accueil</span>
      </Link>
      <Link
        href="/logisticien/nouveau?step=1"
        className="flex flex-col items-center justify-center text-[#4F587E] hover:text-[#3B4252]"
      >
        <Plus size={28} />
        <span className="text-xs mt-1">Nouveau</span>
      </Link>
    </nav>
  );
}
