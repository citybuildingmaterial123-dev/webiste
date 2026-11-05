"use client";

import { Check } from "lucide-react";
import { useId, useRef, useState } from "react";
import type { CustomerDetails, RequirementItem } from "@/types/requirements";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { siteConfig } from "@/config/site";
import { clearRequirements, loadCustomerDetails, saveCustomerDetails } from "@/lib/requirements-store";
import { buildQuoteWhatsAppUrl } from "@/lib/whatsapp";

type Field = "name" | "phone" | "location";
type Errors = Partial<Record<Field, string>>;

export function validateCustomer(details: CustomerDetails): Errors {
  const errors: Errors = {};
  if (details.name.trim().length < 2) errors.name = "Enter your name.";
  const digits = details.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) errors.phone = "Enter a phone number with at least 10 digits.";
  if (details.location.trim().length < 2) errors.location = "Enter the project location or area.";
  return errors;
}

/**
 * Collects the customer's details, then opens WhatsApp with the full enquiry.
 * Nothing is sent from this website: the customer presses send in WhatsApp.
 */
export function QuoteForm({ items }: { items: RequirementItem[] }) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [details, setDetails] = useState<CustomerDetails>(() => ({
    name: "",
    phone: "",
    location: "",
    projectDetails: "",
    ...loadCustomerDetails(),
  }));
  const [errors, setErrors] = useState<Errors>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);

  const set = (field: keyof CustomerDetails) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDetails((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field as Field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validateCustomer(details);
    setErrors(found);
    const firstInvalid = (["name", "phone", "location"] as Field[]).find((field) => found[field]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(`${id}-${firstInvalid}`)}`)?.focus();
      return;
    }

    const url = buildQuoteWhatsAppUrl(siteConfig.contact.whatsappNumber, {
      storeName: siteConfig.name,
      customer: details,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        categoryName: item.categoryName,
        subcategoryName: item.subcategoryName,
        brand: item.brand,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes,
      })),
    });
    saveCustomerDetails({ name: details.name.trim(), phone: details.phone.trim(), location: details.location.trim() });
    setSentUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (sentUrl) {
    return (
      <div className="border border-line bg-paper p-6 sm:p-8" role="status">
        <p className="flex items-center gap-2 text-label font-medium text-muted">
          <Check className="size-4 text-accent" aria-hidden="true" />
          Enquiry prepared
        </p>
        <h2 className="mt-3 text-h2-sm">Your enquiry is ready in WhatsApp</h2>
        <p className="mt-3 text-body text-muted">
          Press send in WhatsApp to share it with our team. We reply with prices and availability during opening
          hours. If WhatsApp did not open, use the button below.
        </p>
        <div className="mt-6 grid gap-3">
          <a href={sentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full">
            <WhatsAppIcon tone="white" />
            Open WhatsApp
          </a>
          <button type="button" onClick={() => setSentUrl(null)} className="btn btn-secondary w-full">
            Edit my details
          </button>
        </div>
        {items.length > 0 && (
          <p className="mt-5 text-body text-muted">
            {cleared ? (
              "Your list has been cleared."
            ) : (
              <>
                Sent the message?{" "}
                <button
                  type="button"
                  className="link text-ink"
                  onClick={() => {
                    clearRequirements();
                    setCleared(true);
                  }}
                >
                  Clear my list
                </button>{" "}
                to start a new one.
              </>
            )}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 border border-line bg-paper p-6 sm:p-8"
    >
      <h2 id={`${id}-title`} className="text-h2-sm">
        Request a quote
      </h2>
      <p className="mt-2 text-body text-muted">
        {items.length > 0
          ? `Your ${items.length === 1 ? "product" : `${items.length} products`} and these details go into one WhatsApp message.`
          : "No products added yet. You can still send a general enquiry about your project."}
      </p>

      <div className="mt-6 grid gap-4">
        <TextField id={`${id}-name`} label="Your name" autoComplete="name" value={details.name} onChange={set("name")} error={errors.name} />
        <TextField
          id={`${id}-phone`}
          label="Phone number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={details.phone}
          onChange={set("phone")}
          error={errors.phone}
        />
        <TextField
          id={`${id}-location`}
          label="Project location"
          autoComplete="address-level2"
          placeholder="Area or town"
          value={details.location}
          onChange={set("location")}
          error={errors.location}
        />
        <div>
          <label htmlFor={`${id}-details`} className="label">
            Project details <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id={`${id}-details`}
            value={details.projectDetails}
            onChange={set("projectDetails")}
            rows={3}
            maxLength={1000}
            placeholder="Type of project, timeline, delivery needs"
            className="field"
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary mt-6 w-full">
        <WhatsAppIcon tone="white" />
        Send enquiry on WhatsApp
      </button>
      <p className="mt-3 text-small text-muted">
        WhatsApp opens with your enquiry filled in. Your details stay on this device and are only shared when you
        press send in WhatsApp.
      </p>
    </form>
  );
}

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

function TextField({ id, label, error, ...input }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        type="text"
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="field"
        {...input}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-small text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
