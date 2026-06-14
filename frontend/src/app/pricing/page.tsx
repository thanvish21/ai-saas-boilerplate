import { Pricing } from "@/components/Pricing";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-10 text-center text-4xl font-bold">Choose your plan</h1>
      <Pricing />
    </main>
  );
}
