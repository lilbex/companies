'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFormik } from 'formik';
import { api } from '@/lib/api';
import { managerLoginSchema } from '@/lib/validations';
import { useLoginManager } from '@/lib/hooks';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginManager();

  useEffect(() => {
    if (searchParams.get('setup') === 'complete') {
      setSuccessMessage('Company setup completed! Please login to continue.');
    }
  }, [searchParams]);

  const formik = useFormik({
    initialValues: {
      emailOrPhone: '',
      password: '',
    },
    validationSchema: managerLoginSchema,
    onSubmit: async (values) => {
      setSuccessMessage('');
      try {
        const response = await loginMutation.mutateAsync(values);
        api.setToken(response.access_token);
        localStorage.setItem('managerData', JSON.stringify(response.user));
        router.push('/dashboard');
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
            Manager Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your manager dashboard
          </p>
        </div>
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700">
                Email or Phone Number
              </label>
              <input
                id="emailOrPhone"
                name="emailOrPhone"
                type="text"
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  formik.touched.emailOrPhone && formik.errors.emailOrPhone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email or phone number"
                {...formik.getFieldProps('emailOrPhone')}
              />
              {formik.touched.emailOrPhone && formik.errors.emailOrPhone && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.emailOrPhone}</div>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 pr-10 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                    formik.touched.password && formik.errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  {...formik.getFieldProps('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.password}</div>
              )}
            </div>
          </div>

          {loginMutation.error && (
            <div className="text-red-600 text-sm text-center">
              {loginMutation.error.message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="font-medium text-green-600 hover:text-green-500">
                Sign up
              </a>
            </span>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}