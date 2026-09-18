'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMerchant } from '@/lib/hooks';
import MerchantProfileForm from '@/components/MerchantProfileForm';

export default function MerchantSetupPage() {
  const router = useRouter();
  // This page is the first-time onboarding flow only: a brand-new merchant
  // finishing signup, or a merchant whose profile creation got interrupted
  // (e.g. the old signup 401) landing here via the login redirect (see
  // app/login/page.tsx). Editing an existing profile now happens on
  // app/dashboard/profile instead, inside the normal dashboard chrome --
  // this standalone page has no sidebar/navbar, which is right for
  // onboarding (nothing in the dashboard works yet without a profile) but
  // was wrong for a merchant looking to just edit their details later.
  const { data: merchant, isLoading, isError } = useMerchant();
  const hasProfile = !isLoading && !isError && !!merchant;

  useEffect(() => {
    if (hasProfile) router.replace('/dashboard/profile');
  }, [hasProfile, router]);

  if (isLoading || hasProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading your restaurant profile…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full space-y-8 px-4">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Set Up Your Restaurant</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This is what customers will see when browsing restaurants in the CityWheels app
          </p>
        </div>
        <MerchantProfileForm isEditing={false} onSaved={() => router.push('/dashboard/wallet')} />
      </div>
    </div>
  );
}
