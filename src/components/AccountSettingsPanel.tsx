import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usersApi, extractErrorMessage } from '../services/api';
import { WorkerAvatar } from './WorkerCard';

export function AccountSettingsPanel() {
  const { user, setUserState } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setLocation(user.location);
      setProfileImage(user.profileImage || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');

    if (name.trim().length < 2) {
      setProfileError('Full name must be at least 2 characters.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setProfileError('Please provide a valid phone number (at least 10 digits).');
      return;
    }
    if (location.trim().length < 2) {
      setProfileError('Location is required.');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await usersApi.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        profileImage: profileImage.trim(),
      });
      setUserState(res.user);
      showToast('Profile information updated.', 'success');
    } catch (err) {
      setProfileError(extractErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSaved(false);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await usersApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordSaved(true);
      showToast('Password changed successfully.', 'success');
    } catch (err) {
      setPasswordError(extractErrorMessage(err, 'Could not change password.'));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Personal Profile Form */}
      <section className="lg:col-span-7 bg-white border border-[#E2E5DF] rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-4 pb-4 border-b border-[#E2E5DF]">
          <WorkerAvatar src={profileImage} name={name || 'User'} size="md" />
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-[#252B29]">
              Personal Information
            </h2>
            <p className="text-xs text-[#5C6662]">{user?.email}</p>
          </div>
        </div>

        {profileError && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="profile-name" className="block text-xs font-medium text-[#252B29]">
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-phone" className="block text-xs font-medium text-[#252B29]">
                Phone Number
              </label>
              <input
                id="profile-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] font-mono tabular-nums focus:outline-none focus:border-[#174C3C]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-location" className="block text-xs font-medium text-[#252B29]">
              Location / Neighbourhood
            </label>
            <input
              id="profile-location"
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-image" className="block text-xs font-medium text-[#252B29]">
              Profile Photo Path or URL (optional)
            </label>
            <input
              id="profile-image"
              type="text"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="/src/assets/images/..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C]"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] disabled:opacity-60 cursor-pointer"
          >
            {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </section>

      {/* Change Password Form */}
      <section className="lg:col-span-5 bg-white border border-[#E2E5DF] rounded-xl p-6 space-y-5">
        <div className="pb-4 border-b border-[#E2E5DF]">
          <h2 className="font-display text-lg font-semibold text-[#252B29]">Change Password</h2>
          <p className="text-xs text-[#5C6662] mt-0.5">
            Update your account password securely. Passwords are always bcrypt-hashed.
          </p>
        </div>

        {passwordError && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSaved && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-[#ECFDF3] border border-[#16A34A]/30 text-xs text-[#14532D]">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>Your password has been updated.</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="current-password" className="block text-xs font-medium text-[#252B29]">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new-password" className="block text-xs font-medium text-[#252B29]">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirm-new-password"
              className="block text-xs font-medium text-[#252B29]"
            >
              Confirm New Password
            </label>
            <input
              id="confirm-new-password"
              type="password"
              required
              minLength={6}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D4D8D2] focus:outline-none focus:border-[#174C3C]"
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="w-full px-5 py-2.5 text-sm font-semibold text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] disabled:opacity-60 cursor-pointer"
          >
            {savingPassword ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </section>
    </div>
  );
}
