import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { OneTimeCheckoutModal } from './OneTimeCheckoutModal';

interface CheckoutButtonProps {
  className?: string;
  buttonText?: string;
  productName?: string;
  amountUsd?: number;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  className,
  buttonText = 'Pay with Checkout',
  productName = 'Example Product',
  amountUsd = 20.0,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={
          className ||
          'inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer'
        }
      >
        <CreditCard className="w-3.5 h-3.5" />
        <span>{buttonText}</span>
      </button>

      <OneTimeCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={productName}
        amountUsd={amountUsd}
      />
    </>
  );
};
