"use client";

import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";

import { event } from "@/lib/gtag";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type ConsultationFormProps = {
  source: string;
  contextLabel: string;
  tripName?: string;
  className?: string;
};

export function ConsultationForm({ source, contextLabel, tripName, className }: ConsultationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    travelWindow: "",
    notes: "",
  });

  const handleSubmit = (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();

    const message = [
      "Assalamu alaikum,",
      "",
      `I would like help planning my Umrah or Hajj.`,
      `Page: ${source}`,
      `Context: ${contextLabel}`,
      tripName ? `Journey: ${tripName}` : null,
      `Name: ${formData.name}`,
      `Phone: ${formData.phone}`,
      formData.email ? `Email: ${formData.email}` : null,
      formData.travelWindow ? `Travel window: ${formData.travelWindow}` : null,
      formData.notes ? `Notes: ${formData.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    event({
      action: `${source}_consultation_submit`,
      category: "conversion",
      label: tripName || contextLabel,
    });

    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const inputClassName =
    "w-full rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] px-4 py-3 text-sm text-[color:var(--ink-strong)] outline-none transition focus:border-[color:var(--brand-maroon)] focus:bg-white";

  return (
    <form onSubmit={handleSubmit} className={cn("grid gap-4", className)}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-[color:var(--ink-soft)]">
          Full name
          <input
            required
            value={formData.name}
            onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
            placeholder="Full name"
            className={inputClassName}
          />
        </label>
        <label className="grid gap-2 text-sm text-[color:var(--ink-soft)]">
          Phone or WhatsApp
          <input
            required
            value={formData.phone}
            onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
            placeholder="Phone or WhatsApp"
            className={inputClassName}
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-[color:var(--ink-soft)]">
          Email address
          <input
            value={formData.email}
            onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
            placeholder="Email address"
            className={inputClassName}
          />
        </label>
        <label className="grid gap-2 text-sm text-[color:var(--ink-soft)]">
          Preferred travel window
          <input
            value={formData.travelWindow}
            onChange={(event) => setFormData((current) => ({ ...current, travelWindow: event.target.value }))}
            placeholder="Preferred travel window"
            className={inputClassName}
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm text-[color:var(--ink-soft)]">
        What would you like help with?
        <textarea
          value={formData.notes}
          onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))}
          placeholder="Tell us what you need help with"
          className={`${inputClassName} min-h-[140px] resize-y`}
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand-maroon)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(151,2,70,0.22)] transition hover:-translate-y-0.5 hover:bg-[color:var(--brand-maroon-deep)]"
      >
        <MessageCircle className="h-4 w-4" />
        Ask on WhatsApp
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

type GuideRequestFormProps = {
  source: string;
  className?: string;
};

export function GuideRequestForm({ source, className }: GuideRequestFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();

    event({
      action: `${source}_guide_request`,
      category: "nurture",
      label: email,
    });

    const subject = encodeURIComponent("Please send me the Al Hilal planning guide");
    const body = encodeURIComponent(
      `Assalamu alaikum,\n\nPlease send me the Al Hilal planning guide.\n\nName: ${name}\nEmail: ${email}\nSource: ${source}\n`,
    );

    window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
  };

  const inputClassName =
    "w-full rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] px-4 py-3 text-sm text-[color:var(--ink-strong)] outline-none transition focus:border-[color:var(--brand-maroon)] focus:bg-white";

  return (
    <form onSubmit={handleSubmit} className={cn("grid gap-4", className)}>
      <label className="grid gap-2 text-sm text-[color:var(--ink-soft)]">
        Full name
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Full name"
          className={inputClassName}
        />
      </label>
      <label className="grid gap-2 text-sm text-[color:var(--ink-soft)]">
        Email address
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className={inputClassName}
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-white px-6 py-3.5 text-sm font-semibold text-[color:var(--brand-maroon)] shadow-[0_14px_32px_rgba(39,28,33,0.05)] transition hover:-translate-y-0.5 hover:border-[color:var(--brand-maroon)]"
      >
        <Mail className="h-4 w-4" />
        Send me the planning guide
      </button>
    </form>
  );
}
