// Frontend Form Validation Schemas
// Using Zod for runtime validation with React Hook Form integration

import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .min(1, 'Password is required')
});

export const registerCompanySchema = z.object({
  name: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(255, 'Company name must not exceed 255 characters')
    .min(1, 'Company name is required'),
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .min(1, 'Password is required'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const registerSalesPersonSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .min(1, 'Name is required'),
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .min(1, 'Password is required'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
  companyId: z.number()
    .int('Company must be selected')
    .positive('Invalid company selection')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  oldPassword: z.string()
    .min(1, 'Current password is required'),
  newPassword: z.string()
    .min(6, 'New password must be at least 6 characters')
    .min(1, 'New password is required'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your new password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.oldPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

// Product Schemas
export const productSchema = z.object({
  name: z.string()
    .min(2, 'Product name must be at least 2 characters')
    .min(1, 'Product name is required'),
  price: z.number()
    .positive('Price must be greater than 0')
    .min(0.01, 'Invalid price'),
  commission_type: z.enum(['fixed', 'percentage'], {
    errorMap: () => ({ message: 'Please select a commission type' })
  }),
  commission_value: z.number()
    .positive('Commission value must be greater than 0')
    .min(0.01, 'Invalid commission value'),
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
});

// Order Schemas
export const orderSchema = z.object({
  product_id: z.number()
    .int('Product must be selected')
    .positive('Invalid product selection'),
  quantity: z.number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .positive('Quantity must be positive'),
  customer_email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  notes: z.string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional()
    .or(z.literal(''))
});

// Report Filters
export const reportFilterSchema = z.object({
  start_date: z.string()
    .min(1, 'Start date is required'),
  end_date: z.string()
    .min(1, 'End date is required')
}).refine((data) => new Date(data.start_date) <= new Date(data.end_date), {
  message: 'End date must be after start date',
  path: ['end_date'],
});

// Profile Update Schema
export const profileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^[0-9\s\-\+\(\)]*$/, 'Invalid phone number format')
    .optional()
    .or(z.literal(''))
});

export type LoginFormInputs = z.infer<typeof loginSchema>;
export type RegisterCompanyFormInputs = z.infer<typeof registerCompanySchema>;
export type RegisterSalesPersonFormInputs = z.infer<typeof registerSalesPersonSchema>;
export type ChangePasswordFormInputs = z.infer<typeof changePasswordSchema>;
export type ProductFormInputs = z.infer<typeof productSchema>;
export type OrderFormInputs = z.infer<typeof orderSchema>;
export type ReportFilterInputs = z.infer<typeof reportFilterSchema>;
export type ProfileFormInputs = z.infer<typeof profileSchema>;
