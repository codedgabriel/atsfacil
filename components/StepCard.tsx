import clsx from "clsx";

export function StepCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={clsx("mx-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8", className)}>
      {children}
    </section>
  );
}
