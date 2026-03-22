"use client";

import { useState, type FormEvent } from "react";

export default function MuslimProContactSection() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!firstName.trim() || !email.trim() || !subject.trim() || !emailBody.trim()) {
      setError("Please fill in first name, email, subject, and your message.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          subject: subject.trim(),
          emailBody: emailBody.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setSubject("");
      setEmailBody("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder:text-white/45 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none";

  return (
    <section id="contact" className="py-16 md:py-20 bg-[#032117] border-t border-white/10 scroll-mt-24">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">Contact us</h2>
        <p className="text-white/65 text-center text-sm mb-8">
          Send us a message. Fields marked * are required to submit.
        </p>

        {done ? (
          <div
            className="rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-6 py-8 text-center"
            role="status"
          >
            <p className="text-white font-semibold mb-2">Your message has been sent.</p>
            <p className="text-white/80 text-sm leading-relaxed">
              A team member will review your email and get back to you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-first" className="block text-sm font-medium text-white/80 mb-1.5">
                  First name *
                </label>
                <input
                  id="contact-first"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="contact-last" className="block text-sm font-medium text-white/80 mb-1.5">
                  Last name <span className="text-white/45">(optional)</span>
                </label>
                <input
                  id="contact-last"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label htmlFor="contact-phone" className="block text-sm font-medium text-white/80 mb-1.5">
                Contact number <span className="text-white/45">(optional)</span>
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-white/80 mb-1.5">
                Email *
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="contact-subject" className="block text-sm font-medium text-white/80 mb-1.5">
                Subject *
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="contact-body" className="block text-sm font-medium text-white/80 mb-1.5">
                Your message *
              </label>
              <textarea
                id="contact-body"
                name="emailBody"
                rows={5}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className={`${inputClass} resize-y min-h-[120px]`}
                placeholder="Your question or reason for contacting us"
                required
              />
            </div>
            {error ? <p className="text-red-300 text-sm">{error}</p> : null}
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#D4AF37] text-[#032117] font-bold hover:bg-[#E8D5A3] transition-colors disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
