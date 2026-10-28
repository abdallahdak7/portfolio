import { CalendarDays } from "lucide-react";
import { about } from "@/content";
import { analytics } from "@/lib/tom";

/** "Book a call", the primary call to action. Opens the Booking link in a new tab and counts a Contact. */
export function BookingLink({ from, className }: { from: "hero" | "contact"; className: string }) {
  return (
    <a href={about.bookingLink} target="_blank" rel="noreferrer" onClick={() => analytics.contact("booking", from)} className={className}>
      <CalendarDays aria-hidden className="h-[1em] w-[1em]" /> Book a call
    </a>
  );
}
