import CareApp from "@/components/CareApp";
import { getCareData } from "@/lib/careStorage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getCareData();

  return (
    <>
      <header className="page-header">
        <h1>革製品ケア記録</h1>
      </header>
      <CareApp initialData={data} />
    </>
  );
}
