"use client";

import { ArrowRight, CheckCircle2, Mail, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { createWebsiteLead } from "@/lib/leads";
import { analyticsEventNames, trackLeadState } from "@/lib/gtag";
import { cn } from "@/lib/utils";

type ConsultationFormProps = {
  source: string;
  contextLabel: string;
  tripName?: string;
  tripId?: string;
  className?: string;
};

export function ConsultationForm({ source, contextLabel, tripName, tripId, className }: ConsultationFormProps) {
  const pathname = usePathname();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    travelWindow: "",
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();

    try {
      setStatus("submitting");
      setErrorMessage("");
      trackLeadState(analyticsEventNames.leadSubmitStarted, {
        pagePath: pathname,
        source,
        contextLabel,
        ctaLabel: "consultation_form_submit",
        interestType: "CONSULTATION",
        tripId,
      });

      await createWebsiteLead({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        interestType: "CONSULTATION",
        travelWindow: formData.travelWindow,
        notes: formData.notes,
        tripId,
        source,
        contextLabel,
        ctaLabel: "consultation_form_submit",
      });

      trackLeadState(analyticsEventNames.leadSubmitSucceeded, {
        pagePath: pathname,
        source,
        contextLabel,
        ctaLabel: "consultation_form_submit",
        interestType: "CONSULTATION",
        tripId,
      });
      setStatus("success");
    } catch (error) {
      trackLeadState(analyticsEventNames.leadSubmitFailed, {
        pagePath: pathname,
        source,
        contextLabel,
        ctaLabel: "consultation_form_submit",
        interestType: "CONSULTATION",
        tripId,
      });
      setErrorMessage(error instanceof Error ? error.message : "We could not save your request. Please try again.")
      setStatus("error");
    }
  };

  const inputClassName =
    "w-full rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] px-4 py-3 text-sm text-[color:var(--ink-strong)] outline-none transition focus:border-[color:var(--brand-maroon)] focus:bg-white";

  if (status === "success") {
    return (
      <div className={cn("rounded-[2rem] border border-[color:var(--border-soft)] bg-white p-5 shadow-[0_14px_32px_rgba(39,28,33,0.05)]", className)}>
        <div className="inline-flex rounded-full bg-[color:var(--surface-tint)] p-3 text-[color:var(--brand-maroon)]">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-xl font-bold tracking-[-0.04em] text-[color:var(--ink-strong)]">Your consultation request is saved.</h3>
        <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
          Al Hilal will review your details{tripName ? ` for ${tripName}` : ""} and follow up directly using the contact details you shared here. WhatsApp is optional now, not required.
        </p>
      </div>
    );
  }

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
      {status === "error" ? (
        <p className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
      ) : null}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand-maroon)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(151,2,70,0.22)] transition hover:-translate-y-0.5 hover:bg-[color:var(--brand-maroon-deep)]"
      >
        <MessageCircle className="h-4 w-4" />
        {status === "submitting" ? "Saving request..." : "Request follow-up"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

type GuideRequestFormProps = {
  source: string;
  contextLabel?: string;
  tripId?: string;
  className?: string;
};

export function GuideRequestForm({ source, contextLabel, tripId, className }: GuideRequestFormProps) {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();

    try {
      setStatus("submitting");
      setErrorMessage("");
      trackLeadState(analyticsEventNames.leadSubmitStarted, {
        pagePath: pathname,
        source,
        contextLabel: contextLabel || `${source}_guide_request`,
        ctaLabel: "guide_request_form_submit",
        interestType: "GUIDE_REQUEST",
        tripId,
      });

      await createWebsiteLead({
        name,
        phone: "",
        email,
        interestType: "GUIDE_REQUEST",
        tripId,
        source,
        contextLabel: contextLabel || `${source}_guide_request`,
        ctaLabel: "guide_request_form_submit",
      });

      trackLeadState(analyticsEventNames.leadSubmitSucceeded, {
        pagePath: pathname,
        source,
        contextLabel: contextLabel || `${source}_guide_request`,
        ctaLabel: "guide_request_form_submit",
        interestType: "GUIDE_REQUEST",
        tripId,
      });
      setStatus("success");
    } catch (error) {
      trackLeadState(analyticsEventNames.leadSubmitFailed, {
        pagePath: pathname,
        source,
        contextLabel: contextLabel || `${source}_guide_request`,
        ctaLabel: "guide_request_form_submit",
        interestType: "GUIDE_REQUEST",
        tripId,
      });
      setErrorMessage(error instanceof Error ? error.message : "We could not save your request. Please try again.")
      setStatus("error");
    }
  };

  const inputClassName =
    "w-full rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] px-4 py-3 text-sm text-[color:var(--ink-strong)] outline-none transition focus:border-[color:var(--brand-maroon)] focus:bg-white";

  if (status === "success") {
    return (
      <div className={cn("rounded-[2rem] border border-[color:var(--border-soft)] bg-white p-5 shadow-[0_14px_32px_rgba(39,28,33,0.05)]", className)}>
        <div className="inline-flex rounded-full bg-[color:var(--surface-tint)] p-3 text-[color:var(--brand-maroon)]">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-xl font-bold tracking-[-0.04em] text-[color:var(--ink-strong)]">Planning guide request saved.</h3>
        <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
          The team will send the planning guide manually using the details you shared here and may follow up if timing or support needs need clarification.
        </p>
      </div>
    );
  }

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
      {status === "error" ? (
        <p className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
      ) : null}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-white px-6 py-3.5 text-sm font-semibold text-[color:var(--brand-maroon)] shadow-[0_14px_32px_rgba(39,28,33,0.05)] transition hover:-translate-y-0.5 hover:border-[color:var(--brand-maroon)]"
      >
        <Mail className="h-4 w-4" />
        {status === "submitting" ? "Saving request..." : "Request the planning guide"}
      </button>
    </form>
  );
}
