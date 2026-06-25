const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
    {Icon && (
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy-50">
        <Icon className="h-6 w-6 text-navy-400" strokeWidth={1.5} />
      </div>
    )}
    <h3 className="font-display text-lg font-medium text-ink-900">{title}</h3>
    {message && <p className="mt-1.5 max-w-sm text-sm text-navy-400">{message}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
