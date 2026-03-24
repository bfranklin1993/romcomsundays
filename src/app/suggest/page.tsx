"use client";

import { useState } from "react";

const STREAMING_SERVICES = [
  "Netflix",
  "Hulu",
  "Prime Video",
  "HBO Max",
  "Disney+",
  "Apple TV+",
  "Peacock",
  "Paramount+",
  "Other",
  "Not sure",
];

export default function SuggestPage() {
  const [title, setTitle] = useState("");
  const [streamingService, setStreamingService] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          reason: streamingService ? `Streaming on: ${streamingService}` : "",
          honeypot,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setTitle("");
        setStreamingService("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <h1 className="font-damion text-3xl text-brand mb-2">Suggest a Movie</h1>
      <p className="text-text-secondary text-sm mb-8">
        Know a rom-com I should watch? Let me know!
      </p>

      {status === "success" ? (
        <div className="bg-green-50 text-green-800 rounded-lg p-4 text-sm">
          Thanks for the suggestion! I&apos;ll check it out.
          <button
            onClick={() => setStatus("idle")}
            className="block mt-2 text-brand font-medium"
          >
            Suggest another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Movie Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 border-[1.5px] border-divider rounded-lg text-sm outline-none focus:border-brand transition-colors"
              placeholder="e.g., You've Got Mail"
            />
          </div>

          <div>
            <label htmlFor="streaming" className="block text-sm font-medium mb-1">
              Where can I watch it? <span className="text-red-400">*</span>
            </label>
            <select
              id="streaming"
              value={streamingService}
              onChange={(e) => setStreamingService(e.target.value)}
              required
              className="w-full px-4 py-2.5 border-[1.5px] border-divider rounded-lg text-sm outline-none focus:border-brand transition-colors bg-white"
            >
              <option value="">Select a streaming service</option>
              {STREAMING_SERVICES.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          {/* Honeypot — hidden from real users */}
          <input
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full py-2.5 bg-brand text-white font-medium rounded-lg hover:bg-brand/90 disabled:opacity-50 transition-colors"
          >
            {status === "submitting" ? "Sending..." : "Submit Suggestion"}
          </button>

          {status === "error" && (
            <p className="text-red-500 text-sm">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
