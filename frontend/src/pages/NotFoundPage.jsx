import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
    <p className="font-display text-7xl font-semibold text-navy-200">404</p>
    <h1 className="mt-3 font-display text-2xl font-semibold text-ink-900">Page not found</h1>
    <p className="mt-2 max-w-sm text-sm text-navy-400">The page you're looking for doesn't exist or may have been moved.</p>
    <Link to="/" className="btn-primary mt-6"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
  </div>
);

export default NotFoundPage;
