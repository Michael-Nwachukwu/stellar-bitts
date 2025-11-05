import { useQuery } from "@tanstack/react-query";
import lendingMarket from "@/contracts/lending_market";
import { useWallet } from "@/hooks/useWallet";

/**
 * Hook to fetch all loans where user is the borrower
 * @returns Query result with array of loans
 */
export function useUserLoansAsBorrower() {
  const { address } = useWallet();

  return useQuery({
    queryKey: ["user-loans-borrower", address],
    queryFn: async () => {
      if (!address) throw new Error("Wallet not connected");

      const { result } = await lendingMarket.get_user_loans_as_borrower({
        user: address,
      });

      return result || [];
    },
    enabled: !!address,
    staleTime: 15000, // 15 seconds
    retry: 2,
  });
}

/**
 * Hook to fetch all loans where user is the lender
 * @returns Query result with array of loan IDs
 */
export function useUserLoansAsLender() {
  const { address } = useWallet();

  return useQuery({
    queryKey: ["user-loans-lender", address],
    queryFn: async () => {
      if (!address) throw new Error("Wallet not connected");

      const { result } = await lendingMarket.get_user_loans_as_lender({
        user: address,
      });

      return result || [];
    },
    enabled: !!address,
    staleTime: 15000, // 15 seconds
    retry: 2,
  });
}

/**
 * Hook to fetch all active offers created by the user
 * @returns Query result with array of offer IDs
 */
export function useUserOffers() {
  const { address } = useWallet();

  return useQuery({
    queryKey: ["user-offers", address],
    queryFn: async () => {
      if (!address) throw new Error("Wallet not connected");

      const { result } = await lendingMarket.get_user_offers({
        user: address,
      });

      return result || [];
    },
    enabled: !!address,
    staleTime: 15000, // 15 seconds
    retry: 2,
  });
}
