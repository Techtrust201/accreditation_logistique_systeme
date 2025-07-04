import { notFound } from "next/navigation";
import AccreditationFormCard from "@/components/logisticien/AccreditationFormCard";
import MobileAccreditationEditCard from "@/components/logisticien/MobileAccreditationEditCard";
import prisma from "@/lib/prisma";

export default async function Page(
  { params }: { params: Promise<{ id: string }> } // 🗝️  params est maintenant une Promise
) {
  // 🔑 on attend params avant d’en extraire id
  const { id } = await params;

  const acc = await prisma.accreditation.findUnique({
    where: { id },
    include: { vehicles: true },
  });
  if (!acc) return notFound();

  // ► le reste ne change pas
  let accFixed = acc;
  if (typeof acc.stepOneData === "string") {
    try {
      accFixed = { ...acc, stepOneData: JSON.parse(acc.stepOneData) };
    } catch {
      accFixed = { ...acc, stepOneData: {} };
    }
  }
  if (typeof acc.stepThreeData === "string") {
    try {
      accFixed = {
        ...accFixed,
        stepThreeData: JSON.parse(acc.stepThreeData),
      };
    } catch {
      accFixed = { ...accFixed, stepThreeData: {} };
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-2 sm:p-8">
      {/* Mobile/tablette */}
      <div className="block sm:hidden">
        <MobileAccreditationEditCard acc={accFixed} />
      </div>
      {/* Desktop */}
      <div className="hidden sm:block">
        <AccreditationFormCard acc={accFixed} />
      </div>
    </div>
  );
}
