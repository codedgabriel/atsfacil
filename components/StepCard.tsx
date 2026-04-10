import clsx from "clsx";

export function StepCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={clsx(
        "mx-auto w-full max-w-lg rounded-2xl border border-white/70 bg-white/95 p-6 shadow-soft backdrop-blur sm:p-8",
        className,
      )}
    >
      {children}
    </section>
  );
}
