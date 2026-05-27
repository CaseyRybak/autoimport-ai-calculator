import { CalculatorExperience } from "@/components/calculator/calculator-experience";
import { getVehicleCatalog } from "@/lib/vehicle-catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const catalog = await getVehicleCatalog();

  return <CalculatorExperience catalog={catalog} />;
}
