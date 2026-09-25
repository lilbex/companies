'use client';

import { useState } from 'react';
import { usePayoutBanks, useVerifyPayoutAccount, useSetPayoutAccount } from '@/lib/hooks';

interface PayoutAccountFormProps {
  onSaved: () => void;
  onCancel?: () => void;
}

// The bank-account side of split-payment payouts (see backend
// Merchant.paystackSubaccountCode). Two steps, same shape as how riders
// add a withdrawal account elsewhere in this codebase: pick a bank, enter
// the account number, verify it resolves to a real account (so a typo
// doesn't silently misdirect the merchant's money), then save -- saving is
// what actually creates/updates the Paystack Subaccount their order
// payouts split to.
export default function PayoutAccountForm({ onSaved, onCancel }: PayoutAccountFormProps) {
  const { data: banksData, isLoading: banksLoading, isError: banksError, error: banksErrorObj, refetch: refetchBanks, isRefetching: banksRefetching } = usePayoutBanks();
  const verifyMutation = useVerifyPayoutAccount();
  const saveMutation = useSetPayoutAccount();

  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [resolvedName, setResolvedName] = useState('');

  const banks: { name: string; code: string }[] = banksData?.banks || [];
  const selectedBank = banks.find((b) => b.code === bankCode);

  const handleVerify = () => {
    setResolvedName('');
    verifyMutation.mutate(
      { accountNumber, bankCode },
      { onSuccess: (data: any) => setResolvedName(data.accountName) },
    );
  };

  const handleSave = () => {
    if (!selectedBank || !resolvedName) return;
    saveMutation.mutate(
      { bankCode, bankName: selectedBank.name, accountNumber },
      { onSuccess: onSaved },
    );
  };

  // Changing the account number or bank after a successful verify
  // invalidates that verification -- don't let a stale resolvedName from a
  // different account number get saved.
  const handleAccountNumberChange = (value: string) => {
    setAccountNumber(value.replace(/\D/g, '').slice(0, 10));
    setResolvedName('');
  };
  const handleBankChange = (value: string) => {
    setBankCode(value);
    setResolvedName('');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
        <select
          value={bankCode}
          onChange={(e) => handleBankChange(e.target.value)}
          disabled={banksLoading || banksError}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        >
          <option value="">
            {banksLoading ? 'Loading banks...' : banksError ? 'Could not load banks' : 'Select your bank'}
          </option>
          {banks.map((bank) => (
            <option key={bank.code} value={bank.code}>
              {bank.name}
            </option>
          ))}
        </select>
        {banksError && (
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-red-600 text-sm">
              {(banksErrorObj as any)?.message || 'Failed to load banks. Please try again.'}
            </p>
            <button
              type="button"
              onClick={() => refetchBanks()}
              disabled={banksRefetching}
              className="text-sm font-medium text-green-700 hover:text-green-800 whitespace-nowrap disabled:opacity-50"
            >
              {banksRefetching ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={accountNumber}
            onChange={(e) => handleAccountNumberChange(e.target.value)}
            placeholder="0123456789"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
          <button
            type="button"
            onClick={handleVerify}
            disabled={!bankCode || accountNumber.length < 10 || verifyMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md disabled:opacity-50 whitespace-nowrap"
          >
            {verifyMutation.isPending ? 'Checking...' : 'Verify'}
          </button>
        </div>
        {verifyMutation.isError && (
          <p className="text-red-600 text-sm mt-1">{(verifyMutation.error as any)?.message || 'Could not verify this account.'}</p>
        )}
        {resolvedName && (
          <p className="text-green-700 text-sm mt-1 font-medium">✓ {resolvedName}</p>
        )}
      </div>

      {saveMutation.isError && (
        <p className="text-red-600 text-sm">{(saveMutation.error as any)?.message || 'Could not save your payout account.'}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!resolvedName || saveMutation.isPending}
          className="flex-1 py-2 px-4 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Payout Account'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
