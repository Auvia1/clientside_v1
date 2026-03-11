import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { cn } from "./utils";
import { CheckIcon, ArrowRightIcon, Send } from "lucide-react";

type Step = {
  id: number;
  label: string;
  field: string;
  placeholder: string;
  type?: string;
};

const steps: Step[] = [
  { id: 1, label: "Your Name", field: "name", placeholder: "Dr. / Full name" },
  { id: 2, label: "Clinic Name", field: "clinic", placeholder: "e.g. Sunrise Health Clinic" },
  { id: 3, label: "Email", field: "email", placeholder: "you@yourclinic.com", type: "email" },
];

interface MultiStepFormProps {
  onClose?: () => void;
}

export function MultiStepForm({ onClose }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (isComplete) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(46,125,50,0.12),transparent_60%)]" />
          <div className="relative flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-700">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/10">
              <CheckIcon className="h-8 w-8 text-primary animate-in zoom-in duration-500 delay-200" strokeWidth={2.5} />
            </div>
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-medium tracking-tight">We'll be in touch!</h2>
              <p className="text-sm text-muted-foreground">{formData.name} · {formData.clinic}</p>
              <p className="text-xs text-muted-foreground/70 pt-1">Our team will reach out to {formData.email} shortly.</p>
            </div>
            {onClose && (
              <Button variant="outline" size="sm" className="mt-2" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Step indicators */}
      <div className="mb-10 flex items-center justify-center gap-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            <button
              onClick={() => index < currentStep && setCurrentStep(index)}
              disabled={index > currentStep}
              className={cn(
                "group relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-700 ease-out",
                "disabled:cursor-not-allowed",
                index < currentStep && "bg-primary/15 text-primary",
                index === currentStep && "bg-primary text-primary-foreground shadow-[0_0_20px_-5px_rgba(46,125,50,0.5)]",
                index > currentStep && "bg-muted/50 text-muted-foreground/40",
              )}
            >
              {index < currentStep ? (
                <CheckIcon className="h-4 w-4 animate-in zoom-in duration-500" strokeWidth={2.5} />
              ) : (
                <span className="text-sm font-medium tabular-nums">{step.id}</span>
              )}
              {index === currentStep && (
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-md animate-pulse" />
              )}
            </button>
            {index < steps.length - 1 && (
              <div className="relative h-[1.5px] w-12">
                <div className="absolute inset-0 bg-border/50" />
                <div
                  className="absolute inset-0 bg-primary/50 transition-all duration-700 ease-out origin-left"
                  style={{ transform: `scaleX(${index < currentStep ? 1 : 0})` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-8 overflow-hidden rounded-full bg-muted/30 h-[2px]">
        <div
          className="h-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Form fields */}
      <div className="space-y-8">
        <div key={currentStepData.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="flex items-baseline justify-between">
            <Label htmlFor={currentStepData.field} className="text-lg font-medium tracking-tight text-foreground">
              {currentStepData.label}
            </Label>
            <span className="text-xs font-medium text-muted-foreground/60 tabular-nums">
              {currentStep + 1}/{steps.length}
            </span>
          </div>
          <Input
            id={currentStepData.field}
            type={currentStepData.type ?? "text"}
            placeholder={currentStepData.placeholder}
            value={formData[currentStepData.field] || ""}
            onChange={(e) => handleInputChange(currentStepData.field, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && formData[currentStepData.field]?.trim()) handleNext();
            }}
            autoFocus
            className="h-14 text-base transition-all duration-500 border-border/50 focus:border-primary/30 bg-background/50"
          />
        </div>

        <Button
          onClick={handleNext}
          disabled={!formData[currentStepData.field]?.trim()}
          className="w-full h-12 group relative bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
        >
          <span className="flex items-center justify-center gap-2 font-medium">
            {currentStep === steps.length - 1 ? (
              <>Send <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 duration-300" strokeWidth={2} /></>
            ) : (
              <>Continue <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 duration-300" strokeWidth={2} /></>
            )}
          </span>
        </Button>

        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="w-full text-center text-sm text-muted-foreground/60 hover:text-foreground/80 transition-all duration-300"
          >
            Go back
          </button>
        )}
      </div>
    </div>
  );
}
