export function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const percent = Math.round(((currentStep + 1) / totalSteps) * 100);
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700">
        <span>Passo {currentStep + 1} de {totalSteps}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-brand transition-all duration-300 ease-out" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
