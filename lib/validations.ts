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