const LoadingSpinner = ({ size = 'md', full = false }) => {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-[3px]' };
  const spinner = (
    <div className={`${sizes[size]} animate-spin rounded-full border-navy-200 border-t-navy-700`} />
  );
  if (full) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        {spinner}
      </div>
    );
  }
  return spinner;
};

export default LoadingSpinner;
