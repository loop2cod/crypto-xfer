interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      <div className="flex-1">
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-black h-1 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      <span className="ml-4 text-sm font-medium text-gray-600">
        {currentStep}/{totalSteps}
      </span>
    </div>
  )
}
