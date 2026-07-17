'use client';

import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import { companySetupSchema } from '@/lib/validations';
import { useCreateCompany } from '@/lib/hooks';

export default function CompanySetupPage() {
  const router = useRouter();
  const createCompanyMutation = useCreateCompany();

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
    },
    validationSchema: companySetupSchema,
    onSubmit: async (values) => {
      try {
        await createCompanyMutation.mutateAsync(values);
        router.push('/login?setup=complete');
      } catch (err: any) {
        // Error is handled by React Query
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Setup Your Company
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Complete your company profile to get started
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Company Name *
              </label>
              <input
                id="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter company name"
                {...formik.getFieldProps('name')}
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Brief description of your company"
                {...formik.getFieldProps('description')}
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Business Address *
              </label>
              <textarea
                id="address"
                rows={2}
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter business address"
                {...formik.getFieldProps('address')}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Business Phone
              </label>
              <input
                id="phone"
                type="tel"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter business phone"
                {...formik.getFieldProps('phone')}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Business Email
              </label>
              <input
                id="email"
                type="email"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter business email"
                {...formik.getFieldProps('email')}
              />
            </div>
          </div>

          {createCompanyMutation.error && (
            <div className="text-red-600 text-sm text-center">
              {createCompanyMutation.error.message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={createCompanyMutation.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {createCompanyMutation.isPending ? 'Creating Company...' : 'Complete Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}