"use client";

import { Printer } from "lucide-react";

/** Print, or save as PDF — the browser's own dialog does both. */
export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn btn-primary">
      <Printer size={14} /> Print or save as PDF
    </button>
  );
}
