import React from "react";
import { WalletButton } from "./WalletButton";

const ConnectAccount: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        gap: "10px",
        verticalAlign: "middle",
      }}
    >
      <WalletButton />
    </div>
  );
};

export default ConnectAccount;
