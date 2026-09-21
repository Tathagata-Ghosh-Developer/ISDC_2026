"use client";

import { Printer } from "lucide-react";

/** Print, or save as PDF, the browser's own dialog does both. */
export default function PrintButton({
  label = "Print or save as PDF",
  variant = "primary",
}: {
  label?: string;
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      onClick={() => window.print()}
      className={variant === "ghost" ? "btn btn-ghost" : "btn btn-primary"}
    >
      <Printer size={14} /> {label}
    </button>
  );
}
