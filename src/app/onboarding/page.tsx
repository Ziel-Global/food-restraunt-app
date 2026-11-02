"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const steps = ["Business", "Location", "Operations", "Documents"];

export default function RestaurantOnboarding() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-5">
        <section className="w-full max-w-lg rounded-[28px] border border-line bg-card p-8 text-center shadow-[0_24px_80px_rgba(17,17,17,0.08)]">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-ink text-2xl text-lime">✓</div>
          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">Application submitted</p>
          <h1 className="font-display mt-2 text-2xl font-bold text-ink">We’ll review your restaurant</h1>
          <p className="mt-3 text-[13px] leading-5 text-muted">
            Our team will verify your business, location, menu and documents before the storefront goes live.
          </p>
          <div className="mt-6 rounded-xl border border-line bg-surface p-4 text-left">
            <p className="text-[12px] font-bold text-ink">Status · Pending review</p>
            <p className="mt-1 text-[11px] text-muted">You can sign in to continue editing while we review.</p>
          </div>
          <Link
            href="/login"
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-ink text-[13px] font-bold text-lime transition hover:bg-charcoal-soft"
          >
            Go to partner sign in
          </Link>
        </section>
      </main>
    );
  }

  const fields =
    step === 0
      ? [
          ["Restaurant name", "e.g. Olive & Thyme"],
          ["Owner full name", "Your name"],
          ["Contact phone", "+1 555 123 4567"],
          ["Business email", "you@restaurant.com"],
        ]
      : step === 1
        ? [
            ["Street address", "Street and building number"],
            ["City", "Choose a service city"],
            ["Delivery zone", "Select a delivery zone"],
            ["Map location", "Set pin location"],
          ]
        : step === 2
          ? [
              ["Cuisine", "e.g. Mediterranean"],
              ["Average prep time", "20 minutes"],
              ["Opening hours", "Set after approval"],
              ["Bank account title", "Business account name"],
            ]
          : [
              ["Business registration", "Upload file"],
              ["Food safety license", "Upload file"],
              ["Tax document", "Upload file"],
              ["Restaurant logo and cover", "Upload images"],
            ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(200,255,0,0.08),transparent_28%),linear-gradient(180deg,#f3f5ef_0%,#eef1ea_100%)] px-5 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between">
          <Link href="/login" className="inline-flex items-center gap-3">
            <span className="rounded-xl bg-charcoal px-3 py-2">
              <Image
                src="/brand/crave-logo-white.png"
                alt="Crave"
                width={100}
                height={34}
                className="h-6 w-auto object-contain"
                priority
              />
            </span>
            <span className="hidden text-[11px] font-bold uppercase tracking-[0.16em] text-muted sm:inline">
              Partner onboarding
            </span>
          </Link>
          <Link href="/login" className="text-[12px] font-bold text-ink hover:underline">
            Already a partner? Sign in
          </Link>
        </header>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <section>
            <p className="inline-flex items-center gap-2 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-lime">
              <span className="size-1.5 rounded-full bg-lime" />
              Partner onboarding
            </p>
            <h1 className="font-display mt-4 text-3xl font-bold tracking-tight text-ink">
              Let’s bring your kitchen online.
            </h1>
            <p className="mt-3 text-[13px] leading-5 text-muted">
              Share a few details about your business. Our team will review your application and help you finish setup.
            </p>
            <div className="mt-8 space-y-3">
              {steps.map((label, index) => (
                <div
                  key={label}
                  className={`flex items-center gap-3 rounded-xl p-3 ${
                    index === step ? "border border-line bg-card shadow-sm" : ""
                  }`}
                >
                  <span
                    className={`grid size-7 place-items-center rounded-full text-[10px] font-bold ${
                      index <= step ? "bg-ink text-lime" : "bg-line text-muted"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className={`text-[12px] font-bold ${index === step ? "text-ink" : "text-muted"}`}>{label}</span>
                </div>
              ))}
            </div>
          </section>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (step < steps.length - 1) setStep(step + 1);
              else setSubmitted(true);
            }}
            className="rounded-[28px] border border-line bg-card p-6 shadow-[0_24px_80px_rgba(17,17,17,0.06)] sm:p-8"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
              Step {step + 1} of {steps.length}
            </p>
            <h2 className="font-display mt-2 text-xl font-bold text-ink">{steps[step]} details</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {fields.map(([label, placeholder]) => (
                <label key={label} className="text-[12px] font-bold text-ink">
                  {label}
                  <input
                    required
                    placeholder={placeholder}
                    className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
                  />
                </label>
              ))}
            </div>
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                disabled={!step}
                onClick={() => setStep(step - 1)}
                className="text-[12px] font-bold text-muted disabled:opacity-40"
              >
                ← Back
              </button>
              <button className="h-11 rounded-xl bg-ink px-5 text-[12px] font-bold text-lime transition hover:bg-charcoal-soft">
                {step === steps.length - 1 ? "Submit application" : "Continue →"}
              </button>
            </div>
            <p className="mt-5 text-center text-[11px] text-soft">
              Commission terms and launch currency are confirmed with the platform team.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
