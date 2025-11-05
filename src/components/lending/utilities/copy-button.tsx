"use client";

import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast("Address copied to clipboard", { position: "top-right" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleCopy}
      className="gap-2 bg-transparent"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          {label || "Copied"}
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          {label || "Copy"}
        </>
      )}
    </Button>
  );
}
