'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMerchant } from '@/lib/hooks';
import DashboardLayout from '@/components/DashboardLayout';
import MerchantProfileForm from '@/components/MerchantProfileForm';

// The merchant-facing "Profile" page linked from the dashboard sidebar.
// Previously that link went straight to /merchant-setup, which is a
// standalone onboarding screen with no sidebar/header -- fine for a
// brand-new merchant with nothing else set up yet, but jarring for an
// established merchant just checking or editing their details, since every
// other page in the portal has the normal dashboard chrome. This page wraps
// the same form in DashboardLayout so "Profile" looks like the rest of the
// dashboard.
export default function MerchantProfilePage() {
  const router = useRouter();
  const { data: merchant, isLoading, isError } = useMerchant();

  useEffect(() => {
    // No profile yet (e.g. a manually-typed URL before onboarding
    // finished) -- send them to the real onboarding flow instead of
    // rendering an edit form with nothing to edit.
    if (!isLoading && isError) router.replace('/merchant-setup');
  }, [isLoading, isError, router]);

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto bg-gray-50">
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-sm text-gray-600">Your restaurant's details, as customers see them</p>
          </div>
        </header>

        <main className="p-6">
          {isLoading || isError ? (
            <p className="text-gray-500">Loading your restaurant profile…</p>
          ) : (
            <div className="max-w-2xl bg-white shadow rounded-lg p-6">
              <MerchantProfileForm merchant={merchant} isEditing onSaved={() => {}} />
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
