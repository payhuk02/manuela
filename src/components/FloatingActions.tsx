import { MessageCircle } from "lucide-react";
import { useAppointment } from "@/hooks/useAppointment";
import { AppointmentButton } from "@/components/AppointmentButton";

export const FloatingActions = () => {
  const appt = useAppointment();

  return (
    <div
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex flex-col gap-3 items-end"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom))",
        right: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <AppointmentButton
        variant="appointment"
        size="default"
        showIcon
        className="shadow-elegant h-9 px-3 text-[10px] tracking-[0.15em] sm:h-12 sm:px-8 sm:text-xs sm:tracking-[0.22em]"
      />
      <a
        href={appt.waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="grid place-items-center h-11 w-11 sm:h-14 sm:w-14 rounded-full bg-[#25D366] text-white shadow-gold hover:scale-105 transition-transform duration-300 ease-luxe"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.75} />
      </a>
    </div>
  );
};
