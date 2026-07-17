interface InlineLoaderProps {
  message?: string;
}

export default function InlineLoader({ message = 'Loading...' }: InlineLoaderProps) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-200 border-t-green-600"></div>
      <span className="ml-3 text-sm text-gray-600">{message}</span>
    </div>
  );
}