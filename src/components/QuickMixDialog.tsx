import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QuickMixEngine } from "@/components/QuickMixEngine";
import { Zap } from "lucide-react";

interface QuickMixDialogProps {
  children: React.ReactNode;
}

export function QuickMixDialog({ children }: QuickMixDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Mix Engine
          </DialogTitle>
        </DialogHeader>

        <QuickMixEngine onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}