'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountDeletionPage() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (!tokenParam) {
      setError('Invalid deletion link');
      return;
    }
    setToken(tokenParam);
  }, []);

  const handleDeleteAccount = async () => {
    if (confirmationText !== 'DELETE') {
      setError('Please type "DELETE" to confirm');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch('/api/manager/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Delete failed');
      router.push('/login');
    } catch (err: any) {
      setError('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Account Deletion</h1>
            <p className="text-sm text-gray-600">Permanently delete your account and all associated data</p>
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-xl">⚠️</span>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold text-gray-900">Delete Account</h2>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-red-800 mb-2">What will be deleted:</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Your manager account and profile</li>
                    <li>• All company data and settings</li>
                    <li>• Rider management access</li>
                    <li>• Delivery history and analytics</li>
                    <li>• All associated business data</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">Before you proceed:</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Download any important data you need</li>
                    <li>• Inform your riders about the account closure</li>
                    <li>• Complete any pending deliveries</li>
                    <li>• Settle any outstanding payments</li>
                  </ul>
                </div>
              </div>

              {!showConfirmation ? (
                <div className="flex justify-between">
                  <button
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowConfirmation(true)}
                    className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type "DELETE" to confirm account deletion:
                    </label>
                    <input
                      type="text"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Type DELETE here"
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button
                      onClick={() => {
                        setShowConfirmation(false);
                        setConfirmationText('');
                        setError('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || confirmationText !== 'DELETE'}
                      className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
    </div>
  );
}