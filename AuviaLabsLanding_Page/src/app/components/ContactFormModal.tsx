import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { MultiStepForm } from "./ui/multistep-form";

interface ContactFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactFormModal({ open, onOpenChange }: ContactFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-semibold text-foreground">
            Get Started with Auvia
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tell us about your clinic and we'll be in touch within 24 hours.
          </DialogDescription>
        </DialogHeader>
        <MultiStepForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
