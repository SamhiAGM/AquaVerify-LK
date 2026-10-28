import React, { useState } from 'react';
import { CheckCircle2, Lock, Mail, MapPin, Phone, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { RoleBadge } from '../../../components/ui/Badge';
import { Input, Select } from '../../../components/ui/Input';
import { userService } from '../../../services/userService';
import { authService } from '../../../services/authService';
import { SRI_LANKAN_DISTRICTS } from '../../../utils/constants';

export const ProfilePage: React.FC = () => {
  const { user, updateLocalUser, refreshUser } = useAuth();

  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.district || 'Colombo');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  if (!user) return null;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    setIsUpdatingProfile(true);
    try {
      const updated = await userService.updateUser(user.id, {
        phone: phone.trim(),
        district,
      });
      updateLocalUser(updated);
      setProfileSuccess('Profile contact details updated successfully.');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setProfileError(axiosErr.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      // Use reset password or custom endpoint
      await authService.resetPassword('SELF_PROFILE_UPDATE', newPassword);
      setPasswordSuccess('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setPasswordError(axiosErr.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal information, assigned jurisdiction, and account security.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Left card: Summary */}
        <div className="md:col-span-5 space-y-4">
          <Card className="p-6 text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-2xl uppercase mx-auto shadow-md">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{user.fullName}</h3>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <div className="pt-2">
              <RoleBadge role={user.role} />
            </div>

            <div className="pt-4 border-t border-slate-100 text-left text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>{user.district} District</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-600" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-600" />
                <span>Account Status: {user.enabled ? 'Active & Verified' : 'Disabled'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right card: Edit forms */}
        <div className="md:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              {profileSuccess && (
                <div className="p-3 mb-4 rounded-lg bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{profileSuccess}</span>
                </div>
              )}
              {profileError && (
                <div className="p-3 mb-4 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {profileError}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <Input
                  label="Registered Email (Immutable)"
                  value={user.email}
                  disabled
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <Input
                  label="Contact Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  leftIcon={<Phone className="w-4 h-4" />}
                />

                <Select
                  label="District"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                >
                  {SRI_LANKAN_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d} District
                    </option>
                  ))}
                </Select>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="teal" isLoading={isUpdatingProfile}>
                    Save Contact Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              {passwordSuccess && (
                <div className="p-3 mb-4 rounded-lg bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}
              {passwordError && (
                <div className="p-3 mb-4 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  leftIcon={<Lock className="w-4 h-4" />}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  leftIcon={<Lock className="w-4 h-4" />}
                />

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="teal" isLoading={isUpdatingPassword}>
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
