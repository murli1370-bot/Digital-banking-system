export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num || 0);

export const formatDate = (date, options = {}) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', ...options
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export const formatRelativeTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

export const getInitials = (firstName, lastName) => {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
};

export const maskAccountNumber = (accNum) => {
  if (!accNum) return '';
  return `••••${accNum.slice(-4)}`;
};

export const getStatusColor = (status) => {
  const colors = {
    completed: 'text-sage-500 bg-sage-50',
    active: 'text-sage-500 bg-sage-50',
    approved: 'text-sage-500 bg-sage-50',
    verified: 'text-sage-500 bg-sage-50',
    paid: 'text-sage-500 bg-sage-50',
    pending: 'text-gold-600 bg-gold-50',
    under_review: 'text-gold-600 bg-gold-50',
    submitted: 'text-gold-600 bg-gold-50',
    on_hold: 'text-gold-600 bg-gold-50',
    failed: 'text-rust-500 bg-rust-50',
    rejected: 'text-rust-500 bg-rust-50',
    reversed: 'text-rust-500 bg-rust-50',
    blocked: 'text-rust-500 bg-rust-50',
    frozen: 'text-navy-500 bg-navy-50',
    inactive: 'text-navy-400 bg-navy-50',
    closed: 'text-navy-400 bg-navy-50',
  };
  return colors[status] || 'text-navy-500 bg-navy-50';
};

export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
