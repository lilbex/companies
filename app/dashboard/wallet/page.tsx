'use client';

import { useState } from 'react';
import { useMerchant, useMerchantWallet, useMerchantWalletTransactions } from '@/lib/hooks';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import PayoutAccountForm from '@/components/PayoutAccountForm';

const TX_TYPE_LABEL: Record<string, string> = {
  MERCHANT_ORDER_CREDIT: 'Order payout',
  WITHDRAWAL: 'Withdrawal',
  REFUND: 'Refund',
  ADJUSTMENT: 'Adjustment',
  BONUS: 'Bonus',
  COMMISSION: 'Commission',
  DELIVERY_CREDIT: 'Delivery credit',
};

const STATUS_COLOR: Record<string, string> = {
  SUCCESS: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-800',
};

const formatNaira = (amount?: number) => `₦${(amount || 0).toLocaleString()}`;

const maskAccountNumber = (accountNumber?: string) =>
  accountNumber ? `••••••${accountNumber.slice(-4)}` : '';

// The merchant-facing counterpart to the fleet manager's Earnings page
// (app/dashboard/earnings) -- that page is built around per-rider delivery
// payouts and doesn't apply to a restaurant.
//
// Split payment (backend Merchant.paystackSubaccountCode): a merchant's
// share of every paid order settles straight to the bank account set up
// below via a Paystack Subaccount, on Paystack's own settlement schedule --
// it never sits as a withdrawable balance in this wallet, so there's no
// "Available Balance" / "Withdraw" flow here the way there is for a rider.
// What this page shows instead is the payout account itself, lifetime
// earnings, and a history of what settled from which order.
export default function MerchantWalletPage() {
  const { data: merchant, isLoading: merchantLoading } = useMerchant();
  const { data: wallet, isLoading: walletLoading } = useMerchantWallet();
  const { data: transactions, isLoading: txLoading } = useMerchantWalletTransactions();
  const [editingPayout, setEditingPayout] = useState(false);

  if (merchantLoading || walletLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading your wallet..." size="lg" />
      </DashboardLayout>
    );
  }

  const hasPayoutAccount = !!merchant?.paystackSubaccountCode;

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto bg-gray-50">
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
            <p className="text-sm text-gray-600">Your payout account, lifetime earnings, and order payout history</p>
          </div>
        </header>

        <main className="p-6 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Payout Account</h3>
            <p className="text-sm text-gray-500 mb-4">
              Your share of every paid order is sent directly here — no manual withdrawal needed.
            </p>

            {hasPayoutAccount && !editingPayout ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{merchant?.payoutBankName}</p>
                  <p className="text-sm text-gray-600">
                    {maskAccountNumber(merchant?.payoutAccountNumber)} · {merchant?.payoutAccountName}
                  </p>
                </div>
                <button
                  onClick={() => setEditingPayout(true)}
                  className="text-sm font-medium text-green-700 hover:text-green-800"
                >
                  Change
                </button>
              </div>
            ) : !hasPayoutAccount && !editingPayout ? (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  No payout account set up yet — you can't open for orders until you add one.
                </p>
                <button
                  onClick={() => setEditingPayout(true)}
                  className="text-sm font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg whitespace-nowrap ml-3"
                >
                  Set up
                </button>
              </div>
            ) : (
              <PayoutAccountForm
                onSaved={() => setEditingPayout(false)}
                onCancel={hasPayoutAccount ? () => setEditingPayout(false) : undefined}
              />
            )}
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg max-w-xs">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">∑</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Earned</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatNaira(wallet?.totalEarned)}</dd>
                    <dd className="text-xs text-gray-400">Lifetime, across all settled orders</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Payout History</h3>
            </div>
            {txLoading ? (
              <div className="p-6">
                <LoadingSpinner message="Loading transactions..." size="sm" />
              </div>
            ) : !transactions || transactions.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">No payouts yet. They'll show up here once an order is paid.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((tx: any) => (
                      <tr key={tx._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {TX_TYPE_LABEL[tx.type] || tx.type}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{tx.description || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          +{formatNaira(tx.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLOR[tx.status] || 'bg-gray-100 text-gray-800'}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
