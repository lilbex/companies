'use client';

import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { merchantSetupSchema } from '@/lib/validations';
import { useCreateMerchant, useUpdateMerchant } from '@/lib/hooks';
import AddressInput, { AddressValue } from './AddressInput';

interface Merchant {
  name?: string;
  type?: 'restaurant' | 'store';
  description?: string;
  address?: string;
  location?: { latitude: number; longitude: number };
  phone?: string;
  email?: string;
  openingHours?: string;
}

interface MerchantProfileFormProps {
  /** Existing profile to prefill, when editing. Omit for first-time setup. */
  merchant?: Merchant;
  isEditing: boolean;
  onSaved: () => void;
}

/**
 * The restaurant profile form -- shared by the first-time onboarding flow
 * (app/merchant-setup, standalone, no merchant yet) and the "Profile" page
 * a merchant reaches from the dashboard nav once they're set up (app/
 * dashboard/profile, wrapped in the normal dashboard chrome). Extracted out
 * of app/merchant-setup/page.tsx so both places save through the exact same
 * validation and submit logic.
 *
 * Location capture is a single address-search field (AddressInput) rather
 * than the old click-a-pin-on-a-map picker (components/LocationPicker.tsx,
 * now unused) -- see AddressInput's own comment for why, including how it
 * handles an address that doesn't show up in the suggestion list.
 */
export default function MerchantProfileForm({ merchant, isEditing, onSaved }: MerchantProfileFormProps) {
  const createMerchantMutation = useCreateMerchant();
  const updateMerchantMutation = useUpdateMerchant();
  const saveMutation = isEditing ? updateMerchantMutation : createMerchantMutation;
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(
    merchant?.location || null,
  );
  const [locationError, setLocationError] = useState('');

  const formik = useFormik({
    initialValues: {
      name: merchant?.name || '',
      type: merchant?.type || 'restaurant',
      description: merchant?.description || '',
      address: merchant?.address || '',
      phone: merchant?.phone || '',
      email: merchant?.email || '',
      openingHours: merchant?.openingHours || '',
    },
    validationSchema: merchantSetupSchema,
    enableReinitialize: false,
    onSubmit: async (values) => {
      if (!location) {
        setLocationError('Please search for and select your restaurant’s address.');
        return;
      }
      setLocationError('');
      try {
        await saveMutation.mutateAsync({ ...values, location });
        onSaved();
      } catch (err: any) {
        // Error is handled by React Query
      }
    },
  });

  // Prefill once, in case `merchant` arrives after the initial render (the
  // caller may still be loading it when this form first mounts).
  const [prefilled, setPrefilled] = useState(!!merchant);
  useEffect(() => {
    if (merchant && !prefilled) {
      formik.setValues({
        name: merchant.name || '',
        type: merchant.type || 'restaurant',
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

  const addressValue: AddressValue | null =
    location && formik.values.address ? { addressLine1: formik.values.address, ...location } : null;

  const handleAddressChange = (next: AddressValue | null) => {
    if (next) {
      formik.setFieldValue('address', next.addressLine1);
      setLocation({ latitude: next.latitude, longitude: next.longitude });
      setLocationError('');
    } else {
      formik.setFieldValue('address', '');
      setLocation(null);
    }
  };

  return (
    <form className="space-y-6" onSubmit={formik.handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">What are you selling? *</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => formik.setFieldValue('type', 'restaurant')}
              className={`rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                formik.values.type === 'restaurant' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">🍽️</div>
              <div className="text-sm font-semibold text-gray-900">Food</div>
              <div className="text-xs text-gray-500">A restaurant menu customers order from</div>
            </button>
            <button
              type="button"
              onClick={() => formik.setFieldValue('type', 'store')}
              className={`rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                formik.values.type === 'store' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">🛍️</div>
              <div className="text-sm font-semibold text-gray-900">Other things</div>
              <div className="text-xs text-gray-500">Electronics, phones, perfume, gadgets &amp; more</div>
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            {formik.values.type === 'store' ? 'Store Name *' : 'Restaurant Name *'}
          </label>
          <input
            id="name"
            type="text"
            required
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder={formik.values.type === 'store' ? 'Enter store name' : 'Enter restaurant name'}
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
            placeholder={formik.values.type === 'store' ? 'What do you sell?' : 'What kind of food do you serve?'}
            {...formik.getFieldProps('description')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
          <AddressInput
            value={addressValue}
            onChange={handleAddressChange}
            placeholder={formik.values.type === 'store' ? "Start typing your store's address..." : undefined}
          />
          {formik.touched.address && formik.errors.address && !addressValue && (
            <div className="text-red-600 text-sm mt-1">{formik.errors.address}</div>
          )}
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
            placeholder={formik.values.type === 'store' ? 'Enter store phone' : 'Enter restaurant phone'}
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
            placeholder={formik.values.type === 'store' ? 'Enter store email' : 'Enter restaurant email'}
            {...formik.getFieldProps('email')}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-red-600 text-sm mt-1">{formik.errors.email}</div>
          )}
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
        <div className="text-red-600 text-sm text-center">{(saveMutation.error as any).message}</div>
      )}
      {saveMutation.isSuccess && isEditing && (
        <div className="text-green-700 text-sm text-center">Saved.</div>
      )}

      <div>
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {saveMutation.isPending ? (isEditing ? 'Saving…' : 'Creating Restaurant...') : isEditing ? 'Save Changes' : 'Complete Setup'}
        </button>
      </div>
      {!isEditing && (
        <p className="text-xs text-center text-gray-400">
          A CityWheels admin will need to approve your {formik.values.type === 'store' ? 'store' : 'restaurant'} before it appears to customers.
        </p>
      )}
    </form>
  );
}
