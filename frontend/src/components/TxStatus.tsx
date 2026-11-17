"use client";

type TxStatusProps = {
  isPending?: boolean;
  isConfirming?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  errorMessage?: string;
  successMessage?: string;
};

export function TxStatus({
  isPending,
  isConfirming,
  isSuccess,
  isError,
  errorMessage,
  successMessage = "Transaction confirmed",
}: TxStatusProps) {
  if (isPending) {
    return (
      <p className="mt-2 text-sm text-amber-700" role="status">
        Confirm in your wallet…
      </p>
    );
  }

  if (isConfirming) {
    return (
      <p className="mt-2 text-sm text-amber-700" role="status">
        Transaction pending…
      </p>
    );
  }

  if (isSuccess) {
    return (
      <p className="mt-2 text-sm text-accent" role="status">
        {successMessage}
      </p>
    );
  }

  if (isError) {
    return (
      <p className="mt-2 text-sm text-red-700" role="alert">
        {errorMessage ?? "Transaction failed"}
      </p>
    );
  }

  return null;
}
