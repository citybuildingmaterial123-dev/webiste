import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { routes } from "@/lib/routes";

const STEPS = [
  {
    title: "Choose your products",
    text: "Browse by category, or search by name, size or brand.",
  },
  {
    title: "Add quantities",
    text: "Add each product to your requirements with the quantity, unit and any notes.",
  },
  {
    title: "Send the list on WhatsApp",
    text: "Enter your name, phone and site location. WhatsApp opens with the full list.",
  },
  {
    title: "Get prices and availability",
    text: "Our team replies with a quotation and helps you adjust grades or quantities.",
  },
];

export function QuoteSteps() {
  return (
    <section aria-labelledby="steps-title" className="section-pad bg-surface">
      <div className="wrap">
        <div className="grid gap-3 lg:grid-cols-12 lg:gap-6">
          <h2 id="steps-title" className="text-h2-sm sm:text-h2 lg:col-span-6">
            How to get a quotation
          </h2>
          <p className="max-w-[46ch] text-lead-sm text-muted sm:text-lead lg:col-span-6 lg:col-start-7">
            No account and no online payment. You send us a list and we reply with prices.
          </p>
        </div>
        <ol className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="border-t border-ink pt-5">
              <p className="text-h2-sm text-muted tabular sm:text-h2" aria-hidden="true">
                {index + 1}
              </p>
              <h3 className="mt-6 text-name-sm sm:text-name">
                <span className="sr-only">Step {index + 1}: </span>
                {step.title}
              </h3>
              <p className="mt-2 text-body text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-12">
          <Link href={routes.products} className="link inline-flex items-center gap-1.5 text-body font-medium">
            Start with the product catalogue
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </p>
      </div>
    </section>
  );
}
