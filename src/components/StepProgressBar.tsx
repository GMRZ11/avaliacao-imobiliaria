import React from 'react';

export interface StepProgressBarProps {
  /** Current zero‑based step index. */
  currentStep: number;
  /** Total number of steps in the wizard. */
  totalSteps: number;
}

/**
 * A horizontal progress bar that fills proportionally to the
 * completed steps of a multi‑step form.  It uses Tailwind CSS for
 * styling and animates smoothly as the user advances.
 */
export function StepProgressBar({ currentStep, totalSteps }: StepProgressBarProps) {
  const percentage = Math.min(1, Math.max(0, (currentStep) / (totalSteps - 1))) * 100;
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}