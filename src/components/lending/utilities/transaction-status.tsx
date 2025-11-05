"use client";

import { CheckCircle2, AlertCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionStatusProps {
  status: "pending" | "success" | "error";
  txHash?: string;
  message?: string;
  onRetry?: () => void;
}

export function TransactionStatus({
  status,
  txHash,
  message,
  onRetry,
}: TransactionStatusProps) {
  return (
    <div
      className={`p-4 rounded-lg flex items-start gap-3 ${
        status === "success"
          ? "bg-success/10 border border-success/30"
          : status === "error"
            ? "bg-destructive/10 border border-destructive/30"
            : "bg-primary/10 border border-primary/30"
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {status === "pending" && (
          <Loader className="w-5 h-5 text-primary animate-spin" />
        )}
        {status === "success" && (
          <CheckCircle2 className="w-5 h-5 text-success" />
        )}
        {status === "error" && (
          <AlertCircle className="w-5 h-5 text-destructive" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-foreground">
          {status === "pending" && "Transaction pending..."}
          {status === "success" && "Transaction successful!"}
          {status === "error" && "Transaction failed"}
        </p>
        {message && (
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        )}
        {txHash && (
          <a
            href={`https://stellar.expert/explorer/public/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline mt-1 inline-block"
          >
            View on Stellar Expert
          </a>
        )}
      </div>
      {status === "error" && onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
