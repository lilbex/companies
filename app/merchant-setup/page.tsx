'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import dynamic from 'next/dynamic';
import { merchantSetupSchema } from '@/lib/validations';
import { useCreateMerchant, useMerchant, useUpdateMerchant } from '@/lib/hooks';

// Dynamically import to avoid SSR issues with Leaflet (same pattern as
// app/dashboard/tracking/page.tsx's LiveMap import).
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false });

export default function MerchantSetupPage() {
  const router = useRouter();
  // This page serves three cases with one form: a brand-new merchant
  // finishing signup, an existing merchant editing their profile from the
  // dashboard's Profile link, and a merchant whose profile creation got
  // interrupted (e.g. the old signup 401) landing here via the login
  // redirect. Which one it is comes from whether GET /merchants/profile
  // finds anything -- not from how the page was reached.
  const { data: merchant, isLoading, isError } = useMerchant();
  const isEditing = !isLoading && !isError && !!merchant;
  const createMerchantMutation = useCreateMerchant();
  const updateMerchantMutation = useUpdateMerchant();
  const saveMutation = isEditing ? updateMerchantMutation : createMerchantMutation;
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState('');
  const [prefilled, setPrefilled] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      openingHours: '',
    },
    validationSchema: merchantSetupSchema,
    enableReinitialize: false,
    onSubmit: async (values) => {
      if (!location) {
        setLocationError('Please set your restaurant’s location on the map below.');
        return;
      }
      setLocationError('');
      try {
        await saveMutation.mutateAsync({ ...values, location });
        router.push('/dashboard/orders');
      } catch (err: any) {
        // Error is handled by React Query
      }
    },
  });

  // Prefill once an existing profile loads. Guarded by `prefilled` so it
  // only happens once -- formik.setValues would otherwise stomp on
  // whatever the merchant is actively typing every time this re-runs.
  useEffect(() => {
    if (merchant && !prefilled) {
      formik.setValues({
        name: merchant.name || '',
        description: merchant.description || '',
        address: merchant.address || '',
        phone: merchant.phone || '',
        email: merchant.email || '',
        openingHours: merchant.openingHours || '',
      });
      if (merchant.location) setLocation(merchant.location);
      setPrefilled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchant, prefilled]);

  if (isLoading) {
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
          {isEditing && (
            <button
              type="button"
              onClick={() => router.push('/dashboard/orders')}
              className="text-sm text-green-600 hover:text-green-500 mb-2"
            >
              ← Back to dashboard
            </button>
          )}
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isEditing ? 'Edit Your Restaurant' : 'Set Up Your Restaurant'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This is what customers will see when browsing restaurants in the CityWheels app
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Restaurant Name *
              </label>
              <input
                id="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter restaurant name"
                {...formik.getFieldProps('name')}
              />
              {formik.touched.name && formik.errors.name && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.name}</div>
              )}
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="What kind of food do you serve?"
                {...formik.getFieldProps('description')}
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address *
              </label>
              <textarea
                id="address"
                rows={2}
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter the restaurant's street address"
                {...formik.getFieldProps('address')}
              />
              {formik.touched.address && formik.errors.address && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.address}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location on Map *
              </label>
              <LocationPicker value={location} onChange={setLocation} />
              {locationError && <div className="text-red-600 text-sm mt-1">{locationError}</div>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter restaurant phone"
                {...formik.getFieldProps('phone')}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter restaurant email"
                {...formik.getFieldProps('email')}
              />
            </div>
            <div>
              <label htmlFor="openingHours" className="block text-sm font-medium text-gray-700">
                Opening Hours
              </label>
              <input
                id="openingHours"
                type="text"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="e.g. Mon–Sat 9am–9pm"
                {...formik.getFieldProps('openingHours')}
              />
            </div>
          </div>

          {saveMutation.error && (
            <div className="text-red-600 text-sm text-center">
              {(saveMutation.error as any).message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {saveMutation.isPending
                ? (isEditing ? 'Saving…' : 'Creating Restaurant...')
                : (isEditing ? 'Save Changes' : 'Complete Setup')}
            </button>
          </div>
          {!isEditing && (
            <p className="text-xs text-center text-gray-400">
              A CityWheels admin will need to approve your restaurant before it appears to customers.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
