import { Award, BadgeCheck, Boxes, HardHat, Headset, MessageSquareText } from "lucide-react";
import { photos } from "@/data/photos";
import { Photo } from "@/components/ui/Photo";

const POINTS = [
  {
    icon: Boxes,
    title: "Wide range under one roof",
    text: "Hardware, electricals, plywood, roofing, steel, pipes, cladding and doors from one counter.",
  },
  {
    icon: BadgeCheck,
    title: "Quality products",
    text: "Grades, sizes and specifications stated clearly, so you get the material your work needs.",
  },
  {
    icon: Award,
    title: "Trusted brands",
    text: "Brands that contractors, carpenters and fabricators already know and ask for by name.",
  },
  {
    icon: HardHat,
    title: "Expert assistance",
    text: "Help with choosing the right grade, thickness and quantity for your project.",
  },
  {
    icon: MessageSquareText,
    title: "Easy quotations",
    text: "Send your list on WhatsApp and get prices and availability before you visit.",
  },
  {
    icon: Headset,
    title: "Reliable support",
    text: "One team to talk to before, during and after your purchase.",
  },
];

export function TrustSection() {
  const photo = photos.project;
  return (
    <section aria-labelledby="trust-title" className="section-pad">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-6">
        <div className={photo ? "lg:col-span-7" : "lg:col-span-12"}>
          <h2 id="trust-title" className="text-h2-sm sm:text-h2">
            Why choose us
          </h2>
          <p className="mt-3 max-w-[48ch] text-lead-sm text-muted sm:text-lead">
            A local store for homeowners, contractors, builders, architects, interior designers and fabricators.
          </p>
          <ul className={`mt-10 grid gap-x-6 ${photo ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
            {POINTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 border-t border-line py-5">
                <Icon className="mt-0.5 size-6 shrink-0 text-accent" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <h3 className="text-body font-medium">{title}</h3>
                  <p className="mt-1 text-body text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {photo && (
          <div className="lg:col-span-5">
            <div className="aspect-[4/3] overflow-hidden bg-surface lg:aspect-[4/5]">
              <Photo image={photo} alt={photo.alt} sizes="(min-width: 1280px) 486px, (min-width: 1024px) 40vw, 100vw" className="h-full w-full object-cover" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
