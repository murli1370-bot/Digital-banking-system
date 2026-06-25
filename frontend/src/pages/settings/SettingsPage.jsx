import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, ShieldCheck, Lock, Bell, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { userService, authService } from '../../services';
import StatusBadge from '../../components/common/StatusBadge';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'kyc', label: 'KYC Verification', icon: ShieldCheck },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '',
    address: { street: user?.address?.street || '', city: user?.address?.city || '', state: user?.address?.state || '', zipCode: user?.address?.zipCode || '' }
  });
  const [profileLoading, setProfileLoading] = useState(false);

  const [kycForm, setKycForm] = useState({ documentType: 'aadhaar', documentNumber: '' });
  const [kycFile, setKycFile] = useState(null);
  const [kycLoading, setKycLoading] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState(user?.notificationPreferences || { email: true, sms: true, push: true });

  const switchTab = (id) => {
    setActiveTab(id);
    setSearchParams({ tab: id });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await userService.updateProfile(profileForm);
      updateUser(res.data.data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!kycFile) return toast.error('Please upload a document');
    setKycLoading(true);
    try {
      const formData = new FormData();
      formData.append('documentType', kycForm.documentType);
      formData.append('documentNumber', kycForm.documentNumber);
      formData.append('document', kycFile);
      const res = await userService.submitKYC(formData);
      updateUser(res.data.data);
      toast.success('KYC documents submitted for review');
      setKycFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setKycLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    setPwLoading(true);
    try {
      await authService.updatePassword(pwForm);
      toast.success('Password updated successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setPwLoading(false);
    }
  };

  const handleNotifToggle = async (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    try {
      const res = await userService.updateProfile({ notificationPreferences: updated });
      updateUser(res.data.data);
    } catch {
      toast.error('Failed to update preference');
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account? This action requires support to reverse.')) return;
    try {
      await userService.deactivateAccount();
      toast.success('Account deactivated');
      logout();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate');
    }
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Settings</h1>
        <p className="mt-1 text-sm text-navy-400">Manage your profile, security, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <nav className="space-y-1 lg:col-span-1">
          {tabs.map((tab) => (
            <button
              key={tab.id} onClick={() => switchTab(tab.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-navy-800 text-paper' : 'text-navy-600 hover:bg-navy-50'}`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </nav>

        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-ink-900">Profile information</h2>
              <form onSubmit={handleProfileSubmit} className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">First name</label>
                    <input value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Last name</label>
                    <input value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="input-label">Email</label>
                  <input value={user?.email} disabled className="input-field bg-navy-50 text-navy-400" />
                </div>
                <div>
                  <label className="input-label">Phone</label>
                  <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '') })} className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="input-label">Street address</label>
                    <input value={profileForm.address.street} onChange={(e) => setProfileForm({ ...profileForm, address: { ...profileForm.address, street: e.target.value } })} className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">City</label>
                    <input value={profileForm.address.city} onChange={(e) => setProfileForm({ ...profileForm, address: { ...profileForm.address, city: e.target.value } })} className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">State</label>
                    <input value={profileForm.address.state} onChange={(e) => setProfileForm({ ...profileForm, address: { ...profileForm.address, state: e.target.value } })} className="input-field" />
                  </div>
                </div>
                <button type="submit" disabled={profileLoading} className="btn-primary">{profileLoading ? 'Saving...' : 'Save changes'}</button>
              </form>

              <div className="mt-8 border-t border-navy-100 pt-5">
                <h3 className="text-sm font-semibold text-rust-500">Danger zone</h3>
                <p className="mt-1 text-xs text-navy-400">Deactivating your account will restrict access. Contact support to reactivate.</p>
                <button onClick={handleDeactivate} className="btn-danger mt-3">Deactivate account</button>
              </div>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-ink-900">KYC Verification</h2>
                <StatusBadge status={user?.kycStatus} />
              </div>
              <p className="mt-1.5 text-sm text-navy-400">Submit a government ID to verify your identity and unlock higher limits.</p>

              {user?.kycStatus === 'verified' ? (
                <div className="mt-5 rounded-lg bg-sage-50 p-4 text-sm text-sage-600">Your identity has been verified. No further action needed.</div>
              ) : (
                <form onSubmit={handleKycSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="input-label">Document type</label>
                    <select value={kycForm.documentType} onChange={(e) => setKycForm({ ...kycForm, documentType: e.target.value })} className="input-field">
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="passport">Passport</option>
                      <option value="driving_license">Driving License</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Document number</label>
                    <input required value={kycForm.documentNumber} onChange={(e) => setKycForm({ ...kycForm, documentNumber: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Upload document</label>
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-navy-200 px-4 py-8 text-sm text-navy-400 hover:border-navy-400">
                      <Upload className="h-4 w-4" />
                      {kycFile ? kycFile.name : 'Click to upload (JPG, PNG, PDF)'}
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => setKycFile(e.target.files[0])} />
                    </label>
                  </div>
                  <button type="submit" disabled={kycLoading} className="btn-primary">{kycLoading ? 'Submitting...' : 'Submit for review'}</button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-ink-900">Change password</h2>
              <form onSubmit={handlePasswordSubmit} className="mt-5 max-w-sm space-y-4">
                <div>
                  <label className="input-label">Current password</label>
                  <input required type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="input-label">New password</label>
                  <input required type="password" minLength={8} value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="input-label">Confirm new password</label>
                  <input required type="password" minLength={8} value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} className="input-field" />
                </div>
                <button type="submit" disabled={pwLoading} className="btn-primary">{pwLoading ? 'Updating...' : 'Update password'}</button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-ink-900">Notification preferences</h2>
              <div className="mt-5 space-y-3">
                {[
                  ['email', 'Email notifications', 'Transaction alerts and account updates via email'],
                  ['sms', 'SMS notifications', 'Critical alerts sent to your registered phone'],
                  ['push', 'Push notifications', 'Real-time alerts on your device'],
                ].map(([key, label, desc]) => (
                  <label key={key} className="flex items-center justify-between rounded-lg border border-navy-100 px-4 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-ink-900">{label}</p>
                      <p className="text-xs text-navy-400">{desc}</p>
                    </div>
                    <input type="checkbox" checked={notifPrefs[key]} onChange={() => handleNotifToggle(key)} className="h-4 w-4 accent-navy-700" />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
