interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-green-600`}></div>
      <p className="mt-4 text-gray-600 text-sm">{message}</p>
    </div>
  );
}