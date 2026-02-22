import { useState } from 'react';

/**
 * Options for the useForm hook
 */
export interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<string, string> | null;
  onSubmit: (values: T) => Promise<void>;
}

/**
 * Return type for the useForm hook
 */
export interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  submitError: string | null;
  handleChange: <K extends keyof T>(name: K, value: T[K]) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setValues: React.Dispatch<React.SetStateAction<T>>;
  setFieldError: (field: string, error: string) => void;
  clearFieldError: (field: string) => void;
  reset: () => void;
}

/**
 * Custom hook for managing form state, validation, and submission
 *
 * Provides a consistent interface for handling forms across the application
 * with built-in validation, error handling, and submission state.
 *
 * @param options - Configuration options
 * @returns Form state and handlers
 *
 * @example
 * interface FormData {
 *   email: string;
 *   password: string;
 * }
 *
 * const form = useForm<FormData>({
 *   initialValues: { email: '', password: '' },
 *   validate: (values) => {
 *     const errors: Record<string, string> = {};
 *     if (!values.email) errors.email = 'Email is required';
 *     if (!values.password) errors.password = 'Password is required';
 *     return Object.keys(errors).length > 0 ? errors : null;
 *   },
 *   onSubmit: async (values) => {
 *     await api.login(values);
 *   },
 * });
 *
 * // In JSX:
 * <form onSubmit={form.handleSubmit}>
 *   <input
 *     value={form.values.email}
 *     onChange={(e) => form.handleChange('email', e.target.value)}
 *   />
 *   {form.errors.email && <span>{form.errors.email}</span>}
 *   <button disabled={form.isSubmitting}>Submit</button>
 * </form>
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Update a single field value and clear its error
   */
  const handleChange = <K extends keyof T>(name: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
    }
  };

  /**
   * Set an error for a specific field
   */
  const setFieldError = (field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  /**
   * Clear error for a specific field
   */
  const clearFieldError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  /**
   * Reset form to initial values
   */
  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(false);
  };

  /**
   * Handle form submission with validation
   */
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Validate form
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }
    }

    // Clear any previous errors
    setErrors({});

    try {
      await onSubmit(values);
    } catch (error) {
      // Handle submission error
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else if (typeof error === 'string') {
        setSubmitError(error);
      } else {
        setSubmitError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    setValues,
    setFieldError,
    clearFieldError,
    reset,
  };
}
