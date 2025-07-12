export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import AccreditationFormCard from "@/components/logisticien/AccreditationFormCard";
import MobileAccreditationEditCard from "@/components/logisticien/MobileAccreditationEditCard";
import prisma from "@/lib/prisma";
import { Accreditation } from "@/types";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const acc = await prisma.accreditation.findUnique({
    where: { id },
    include: { vehicles: true },
  });
  if (!acc) return notFound();

  return (
    <div className="max-w-2xl mx-auto p-2 sm:p-8">
      {/* Mobile/tablette */}
      <div className="block sm:hidden">
        <MobileAccreditationEditCard acc={acc as Accreditation} />
      </div>
      {/* Desktop */}
      <div className="hidden sm:block">
        <AccreditationFormCard acc={acc as Accreditation} />
      </div>
    </div>
  );
}
