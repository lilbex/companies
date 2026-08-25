import * as yup from 'yup';

export const managerSignupSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required').min(10, 'Phone number must be at least 10 digits'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

export const companySetupSchema = yup.object({
  name: yup.string().required('Company name is required').min(2, 'Company name must be at least 2 characters'),
  description: yup.string(),
  address: yup.string().required('Business address is required').min(10, 'Please provide a complete address'),
  phone: yup.string(),
  email: yup.string().email('Invalid email format'),
});

export const managerLoginSchema = yup.object({
  emailOrPhone: yup.string().required('Email or phone number is required'),
  password: yup.string().required('Password is required'),
});

// Same shape as managerSignupSchema — kept separate so the two account
// types can diverge later without one edit touching the other.
export const merchantSignupSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required').min(10, 'Phone number must be at least 10 digits'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

export const merchantSetupSchema = yup.object({
  name: yup.string().required('Restaurant name is required').min(2, 'Restaurant name must be at least 2 characters'),
  description: yup.string(),
  address: yup.string().required('Address is required').min(10, 'Please provide a complete address'),
  phone: yup.string(),
  email: yup.string().email('Invalid email format'),
  openingHours: yup.string(),
});

export const menuCategorySchema = yup.object({
  name: yup.string().required('Category name is required'),
});

export const menuItemSchema = yup.object({
  categoryId: yup.string().required('Choose a category'),
  name: yup.string().required('Item name is required'),
  description: yup.string(),
  price: yup.number().typeError('Price must be a number').required('Price is required').min(0, 'Price cannot be negative'),
  imageUrl: yup.string().url('Enter a valid URL').notRequired(),
});

export const riderCreateSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email format'),
  phoneNumber: yup.string().required('Phone number is required').min(10, 'Phone number must be at least 10 digits'),
  password: yup.string().when('email', {
    is: (val: string) => val && val.length > 0,
    then: (schema) => schema.required('Password is required when email is provided').min(6, 'Password must be at least 6 characters'),
    otherwise: (schema) => schema.min(6, 'Password must be at least 6 characters').notRequired(),
  }),
  vehicleType: yup.string().required('Vehicle type is required'),
  vehicleColor: yup.string().required('Vehicle color is required'),
  licensePlate: yup.string().when('vehicleType', {
    is: (val: string) => val !== 'bicycle',
    then: (schema) => schema.required('License plate is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});