const StatCard = ({ label, value, icon: Icon, trend, trendLabel, accent = 'navy' }) => {
  const accents = {
    navy: 'bg-navy-50 text-navy-700',
    gold: 'bg-gold-50 text-gold-600',
    sage: 'bg-sage-50 text-sage-500',
    rust: 'bg-rust-50 text-rust-500',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-navy-400">{label}</p>
          <p className="stat-figure mt-1.5 text-2xl font-semibold text-ink-900">{value}</p>
        </div>
        {Icon && (
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accents[accent]}`}>
            <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <p className={`mt-3 text-xs font-medium ${trend >= 0 ? 'text-sage-500' : 'text-rust-500'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel}
        </p>
      )}
    </div>
  );
};

export default StatCard;
