/**
 * Centralized Tailwind class maps for dynamic styling
 * This ensures Tailwind can detect all used classes at build time
 */

export const StatusClassMap = {
  Active: 'bg-green-100 text-green-800',
  Maintenance: 'bg-yellow-100 text-yellow-800',
  Inactive: 'bg-gray-200 text-gray-700',
  Retired: 'bg-red-100 text-red-800',
  Working: 'bg-green-100 text-green-800',
  'Not Working': 'bg-red-100 text-red-800',
  Missing: 'bg-red-100 text-red-800'
} as const;

export const AlertClassMap = {
  success: 'bg-green-50 text-green-700 border-green-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200'
} as const;

export const ButtonVariantMap = {
  primary: 'bg-primary text-white hover:bg-primary-600',
  success: 'bg-success text-white hover:bg-green-600',
  danger: 'bg-danger text-white hover:bg-red-600',
  warning: 'bg-warning text-white hover:bg-yellow-600',
  info: 'bg-info text-white hover:bg-cyan-600',
  secondary: 'bg-gray-500 text-white hover:bg-gray-600',
  'outline-primary': 'border border-primary text-primary hover:bg-primary hover:text-white',
  'outline-secondary': 'border border-gray-500 text-gray-600 hover:bg-gray-600 hover:text-white',
  'outline-warning': 'border border-warning text-yellow-600 hover:bg-warning hover:text-white',
  'outline-danger': 'border border-danger text-red-600 hover:bg-danger hover:text-white',
  'outline-info': 'border border-info text-cyan-600 hover:bg-info hover:text-white'
} as const;

export const BadgeSizeMap = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5'
} as const;

export const ButtonSizeMap = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3'
} as const;

/**
 * Helper function to get status badge classes
 */
export function getStatusBadgeClasses(status: string): string {
  const baseClasses = 'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium';
  const statusClasses = StatusClassMap[status as keyof typeof StatusClassMap] || StatusClassMap.Inactive;
  return `${baseClasses} ${statusClasses}`;
}

/**
 * Helper function to get button classes
 */
export function getButtonClasses(variant: keyof typeof ButtonVariantMap = 'primary', size: keyof typeof ButtonSizeMap = 'md'): string {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-semibold transition';
  const variantClasses = ButtonVariantMap[variant];
  const sizeClasses = ButtonSizeMap[size];
  return `${baseClasses} ${variantClasses} ${sizeClasses}`;
}

/**
 * Helper function to get alert classes
 */
export function getAlertClasses(type: keyof typeof AlertClassMap): string {
  const baseClasses = 'p-4 rounded-lg border';
  const typeClasses = AlertClassMap[type];
  return `${baseClasses} ${typeClasses}`;
}

