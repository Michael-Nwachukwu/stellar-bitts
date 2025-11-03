"use client";

import { Copy, ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AddressDisplayProps {
  address: string;
  label?: string;
  copyable?: boolean;
}

export function AddressDisplay({
  address,
  label,
  copyable = true,
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard
      .writeText(address)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const truncatedAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            {label && (
              <span className="text-xs text-muted-foreground">{label}:</span>
            )}
            <code className="text-sm font-mono bg-card px-2 py-1 rounded">
              {truncatedAddress}
            </code>
            {copyable && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="h-6 w-6 p-0"
              >
                <Copy className={`w-3 h-3 ${copied ? "text-success" : ""}`} />
              </Button>
            )}
            <a
              href={`https://stellar.expert/explorer/public/account/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-mono text-xs">{address}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
