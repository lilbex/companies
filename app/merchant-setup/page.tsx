'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import dynamic from 'next/dynamic';
import { merchantSetupSchema } from '@/lib/validations';
import { useCreateMerchant } from '@/lib/hooks';

// Dynamically import to avoid SSR issues with Leaflet (same pattern as
// app/dashboard/tracking/page.tsx's LiveMap import).
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false });

export default function MerchantSetupPage() {
  const router = useRouter();
  const createMerchantMutation = useCreateMerchant();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState('');

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
    onSubmit: async (values) => {
      if (!location) {
        setLocationError('Please set your restaurant’s location on the map below.');
        return;
      }
      setLocationError('');
      try {
        await createMerchantMutation.mutateAsync({ ...values, location });
        router.push('/login?setup=complete');
      } catch (err: any) {
        // Error is handled by React Query
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full space-y-8 px-4">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set Up Your Restaurant
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

          {createMerchantMutation.error && (
            <div className="text-red-600 text-sm text-center">
              {createMerchantMutation.error.message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={createMerchantMutation.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {createMerchantMutation.isPending ? 'Creating Restaurant...' : 'Complete Setup'}
            </button>
          </div>
          <p className="text-xs text-center text-gray-400">
            A CityWheels admin will need to approve your restaurant before it appears to customers.
          </p>
        </form>
      </div>
    </div>
  );
}
