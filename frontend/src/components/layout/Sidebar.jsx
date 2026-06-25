import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, ArrowLeftRight, Landmark, CreditCard,
  Settings, X, ShieldCheck, Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/accounts', label: 'Accounts', icon: Wallet },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/loans', label: 'Loans', icon: Landmark },
  { to: '/cards', label: 'Cards', icon: CreditCard },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const adminItems = [
  { to: '/admin', label: 'Admin Dashboard', icon: ShieldCheck },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/loans', label: 'Loan Approvals', icon: Landmark },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-ink-950/40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-ink-950 transition-transform duration-300 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 py-6">
            <div className="flex items-center gap-2.5">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="7" fill="#CDA047"/>
                <path d="M16 6L27 12.5H5L16 6Z" fill="#0A1628"/>
                <rect x="7" y="14" width="3" height="11" fill="#0A1628"/>
                <rect x="14.5" y="14" width="3" height="11" fill="#0A1628"/>
                <rect x="22" y="14" width="3" height="11" fill="#0A1628"/>
                <rect x="5" y="26" width="22" height="2.5" fill="#0A1628"/>
              </svg>
              <span className="font-display text-lg font-semibold text-paper">DigitalBank</span>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-navy-300 hover:bg-ink-800 lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 scrollbar-hide">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-gold-400 text-ink-950' : 'text-navy-200 hover:bg-ink-800 hover:text-paper'
                  }`
                }
              >
                <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                {item.label}
              </NavLink>
            ))}

            {user?.role === 'admin' && (
              <>
                <div className="my-3 border-t border-ink-800" />
                <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-navy-400">Administration</p>
                {adminItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive ? 'bg-gold-400 text-ink-950' : 'text-navy-200 hover:bg-ink-800 hover:text-paper'
                      }`
                    }
                  >
                    <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    {item.label}
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          <div className="mx-3 mb-4 mt-2 rounded-lg bg-ink-900 p-4">
            <p className="text-xs font-medium text-navy-300">Need help?</p>
            <p className="mt-1 text-xs text-navy-400">Reach our support team 24/7 for any banking assistance.</p>
            <button className="mt-3 text-xs font-semibold text-gold-400 hover:text-gold-300">Contact Support →</button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
