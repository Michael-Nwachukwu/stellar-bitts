import { useState } from "react";
import { Button as StellarButton } from "@stellar/design-system";
import { useWallet } from "../hooks/useWallet";
import { useWalletBalance } from "../hooks/useWalletBalance";
import { connectWallet, disconnectWallet } from "../util/wallet";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import GearIcon from "./icons/gear";
import DotsVerticalIcon from "./icons/dots-vertical";

export const WalletButton = () => {
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const { address, isPending } = useWallet();
  const { xlm, ...balance } = useWalletBalance();
  const buttonLabel = isPending ? "Loading..." : "Connect";

  if (!address) {
    return (
      <StellarButton
        variant="primary"
        size="md"
        onClick={() => void connectWallet()}
      >
        {buttonLabel}
      </StellarButton>
    );
  }

  const handleDisconnect = () => {
    void disconnectWallet().then(() => {
      setShowDisconnectModal(false);
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "5px",
        opacity: balance.isLoading ? 0.6 : 1,
      }}
    >
      <AlertDialog
        open={showDisconnectModal}
        onOpenChange={setShowDisconnectModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              Connected as{" "}
              <code className="text-xs break-all bg-muted px-1 py-0.5 rounded">
                {address}
              </code>
              <br />
              <br />
              Do you want to disconnect?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Popover>
        <PopoverTrigger className="flex gap-0.5 w-full group cursor-pointer">
          <div className="shrink-0 flex size-14 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-clip">
            <img
              src={"/avatars/user_krimson.png"}
              alt={"avatar"}
              width={120}
              height={120}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="group/item pl-3 pr-1.5 pt-2 pb-1.5 flex-1 flex bg-sidebar-accent hover:bg-sidebar-accent-active/75 items-center rounded group-data-[state=open]:bg-sidebar-accent-active group-data-[state=open]:hover:bg-sidebar-accent-active group-data-[state=open]:text-sidebar-accent-foreground">
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate text-xl font-display">{xlm} XLM</span>
              <span className="truncate text-xs uppercase opacity-50 group-hover/item:opacity-100">
                {address}
              </span>
            </div>
            <DotsVerticalIcon className="ml-auto size-4" />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-3"
          side="right"
          align="end"
          sideOffset={4}
        >
          <div className="flex flex-col gap-1.5">
            <div className="text-sm">
              Connected as{" "}
              <code className="text-xs break-all bg-muted px-1 py-0.5 rounded">
                {address}
              </code>
            </div>
            <Button
              onClick={() => setShowDisconnectModal(true)}
              variant="destructive"
              className="flex items-center justify-start w-full"
            >
              <GearIcon className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
