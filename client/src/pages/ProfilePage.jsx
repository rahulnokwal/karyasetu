import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/authApi";
import { Avatar } from "../components/common/Avatar";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { Camera, KeyRound, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ProfilePage() {
  const { user, updateUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || "");
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile", file);

    setIsUploadingPhoto(true);
    try {
      const response = await authApi.updateProfileImage(formData);
      updateUser(response.data);
      toast.success("Profile photo updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update profile image");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setIsUpdatingDetails(true);
    try {
      const response = await authApi.updateUserDetails({
        fullName: fullName.trim(),
        email: email.trim(),
        mobileNumber: mobileNumber.trim() || undefined,
      });
      updateUser(response.data);
      toast.success("Details updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update details");
    } finally {
      setIsUpdatingDetails(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await authApi.changePassword({ oldPassword, newPassword });
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal profile, credentials, and contact details
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600" />
          Personal Details
        </h3>

        <div className="flex items-center gap-5">
          <div className="relative group">
            <Avatar src={user?.profile} name={user?.fullName} size="xl" />
            <label className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white">
              {isUploadingPhoto ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={isUploadingPhoto}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900">
              {user?.fullName}
            </h4>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Click on avatar to change photo (supported formats: JPG, PNG,
              WEBP)
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateDetails} className="space-y-4 pt-2">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            helperText="Changing email will require re-verification."
            required
          />

          <Input
            label="Mobile Number"
            type="tel"
            placeholder="+1 234 567 8900"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={isUpdatingDetails}>
              Save Profile
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-indigo-600" />
          Update Password
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={isUpdatingPassword}>
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
