'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import { managerSignupSchema, merchantSignupSchema } from '@/lib/validations';
import { useRegisterManager, useRegisterMerchant } from '@/lib/hooks';

// One shared signup form for both account types this portal serves
// (RESTAURANT_MARKETPLACE_PLAN.md §5a) — the fields are identical, so only
// which endpoint gets called and which setup page comes next differ.
type AccountType = 'manager' | 'merchant';

export default function SignupPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>('manager');
  const registerManagerMutation = useRegisterManager();
  const registerMerchantMutation = useRegisterMerchant();
  const registerMutation = accountType === 'manager' ? registerManagerMutation : registerMerchantMutation;

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: accountType === 'manager' ? managerSignupSchema : merchantSignupSchema,
    enableReinitialize: false,
    onSubmit: async (values) => {
      try {
        const data = {
          name: values.name,
          email: values.email,
          phoneNumber: values.phoneNumber,
          password: values.password,
        };
        if (accountType === 'manager') {
          await registerManagerMutation.mutateAsync(data);
          router.push('/company-setup');
        } else {
          await registerMerchantMutation.mutateAsync(data);
          router.push('/merchant-setup');
        }
      } catch (err: any) {
        // Error is handled by React Query
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            City<span className="text-green-600">Wheels</span>
          </h1>
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900">
            {accountType === 'manager' ? 'Create Manager Account' : 'Create Restaurant Account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {accountType === 'manager' ? 'Sign up to manage your delivery company' : 'Sign up to sell on the CityWheels customer app'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setAccountType('manager')}
            className={`py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              accountType === 'manager' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🚚 Fleet Manager
          </button>
          <button
            type="button"
            onClick={() => setAccountType('merchant')}
            className={`py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              accountType === 'merchant' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🍽️ Restaurant Partner
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  formik.touched.name && formik.errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
                {...formik.getFieldProps('name')}
              />
              {formik.touched.name && formik.errors.name && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.name}</div>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  formik.touched.email && formik.errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                {...formik.getFieldProps('email')}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.email}</div>
              )}
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  formik.touched.phoneNumber && formik.errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your phone number"
                {...formik.getFieldProps('phoneNumber')}
              />
              {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.phoneNumber}</div>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  formik.touched.password && formik.errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                {...formik.getFieldProps('password')}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.password}</div>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
                {...formik.getFieldProps('confirmPassword')}
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.confirmPassword}</div>
              )}
            </div>
          </div>

          {registerMutation.error && (
            <div className="text-red-600 text-sm text-center">
              {registerMutation.error.message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-green-600 hover:text-green-500">
                Sign in
              </a>
            </span>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}