import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

type InfoAlertProps = {
  children: React.ReactNode;
  className?: string;
};

export function InfoAlert({ children, className }: InfoAlertProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-950",
        className,
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
      <div>{children}</div>
    </div>
  );
}
