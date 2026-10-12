"use client";

import { useSyncExternalStore } from "react";
import { Smartphone } from "lucide-react";
import { upiLinks, type UpiPayee } from "@/lib/upi";

/** iPhone or iPad, including iPads that call themselves a Mac. */
function useIos(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () =>
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    () => false,
  );
}

/**
 * The buttons that open the payer's UPI app with the payee filled in.
 * On Android the plain upi:// link offers every installed UPI app. On
 * an iPhone that link opens nothing, so there the app buttons lead and
 * the plain one is left out. Phones only: on a laptop there is no app.
 */
export default function UpiButtons(payee: UpiPayee) {
  const ios = useIos();
  const links = upiLinks(payee);
  const apps = [
    { label: "Google Pay", href: ios ? links.gpayIos : links.gpayAndroid },
    { label: "PhonePe", href: links.phonepe },
    { label: "Paytm", href: links.paytm },
  ];

  return (
    <div className="lg:hidden">
      {!ios && (
        <a href={links.any} className="btn btn-primary mt-5 w-full">
          <Smartphone size={15} /> Open my UPI app
        </a>
      )}
      <p className={`text-[0.68rem] uppercase tracking-[0.2em] text-ink-soft ${ios ? "mt-5" : "mt-4"}`}>
        {ios ? "Open in" : "Or open in"}
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {apps.map((a) => (
          <a
            key={a.label}
            href={a.href}
            className="btn btn-ghost !px-2 !py-3 !text-[max(12px,0.66rem)]"
          >
            {a.label}
          </a>
        ))}
      </div>
    </div>
  );
}
