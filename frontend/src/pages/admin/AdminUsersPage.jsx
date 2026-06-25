import { useState, useEffect, useCallback } from 'react';
import { Search, Check, X, Ban, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services';
import { formatDate, debounce, getInitials } from '../../utils/format';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const fetchUsers = useCallback(async (page = 1, searchVal = search, kyc = kycFilter) => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (searchVal) params.search = searchVal;
      if (kyc) params.kycStatus = kyc;
      const res = await adminService.getUsers(params);
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, kycFilter]);

  const debouncedSearch = useCallback(debounce((val) => fetchUsers(1, val, kycFilter), 400), [fetchUsers, kycFilter]);

  useEffect(() => { fetchUsers(1); }, []); // eslint-disable-line

  const handleSearchChange = (val) => {
    setSearch(val);
    debouncedSearch(val);
  };

  const handleKycAction = async (userId, status) => {
    try {
      await adminService.updateKycStatus(userId, status);
      toast.success(`KYC ${status}`);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await adminService.toggleUserStatus(user._id, !user.isActive);
      toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'}`);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Users</h1>
        <p className="mt-1 text-sm text-navy-400">Manage customers, review KYC, and control account access.</p>
      </div>

      <div className="card flex flex-wrap items-center gap-3 p-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
          <input value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search by name or email..." className="input-field pl-9" />
        </div>
        <select value={kycFilter} onChange={(e) => { setKycFilter(e.target.value); fetchUsers(1, search, e.target.value); }} className="input-field w-auto">
          <option value="">All KYC statuses</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        {loading ? <LoadingSpinner full /> : users.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-left text-xs font-semibold uppercase tracking-wide text-navy-400">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">KYC Status</th>
                <th className="px-5 py-3">Account Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 text-xs font-semibold text-paper">{getInitials(u.firstName, u.lastName)}</div>
                      <div>
                        <p className="font-medium text-ink-900">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-navy-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-navy-500">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={u.kycStatus} /></td>
                  <td className="px-5 py-3.5"><StatusBadge status={u.isActive ? 'active' : 'inactive'} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-2">
                      {u.kycStatus === 'submitted' && (
                        <>
                          <button onClick={() => handleKycAction(u._id, 'verified')} title="Approve KYC" className="rounded-lg p-1.5 text-sage-500 hover:bg-sage-50"><Check className="h-4 w-4" /></button>
                          <button onClick={() => handleKycAction(u._id, 'rejected')} title="Reject KYC" className="rounded-lg p-1.5 text-rust-500 hover:bg-rust-50"><X className="h-4 w-4" /></button>
                        </>
                      )}
                      <button onClick={() => handleToggleStatus(u)} title={u.isActive ? 'Deactivate' : 'Activate'} className={`rounded-lg p-1.5 ${u.isActive ? 'text-rust-500 hover:bg-rust-50' : 'text-sage-500 hover:bg-sage-50'}`}>
                        {u.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-navy-100 px-5 py-3">
            <p className="text-xs text-navy-400">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button disabled={pagination.page <= 1} onClick={() => fetchUsers(pagination.page - 1)} className="btn-ghost !px-3 !py-1.5 text-xs disabled:opacity-40">Previous</button>
              <button disabled={pagination.page >= pagination.pages} onClick={() => fetchUsers(pagination.page + 1)} className="btn-ghost !px-3 !py-1.5 text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
