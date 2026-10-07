import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { Avatar } from "../common/Avatar";
import { LogOut, User, ChevronDown } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export function Topbar() {
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 shrink-0 select-none">
      <div className="flex items-center gap-3">
        <Link
          to="/workspace"
          className="flex items-center gap-2 font-bold text-lg text-indigo-600"
        >
          <img src="/KaryaSetuIcon.png" alt="KaryaSetu" className="h-20" />
          KaryaSetu
        </Link>
      </div>

      <div className="flex items-center gap-4 relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <Avatar src={user?.profile} name={user?.fullName} size="sm" />
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {user?.fullName}
            </p>
            <p className="text-[11px] text-slate-500 leading-tight">
              {user?.email}
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 top-14 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 divide-y divide-slate-100">
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {user?.fullName}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {user?.email}
                </p>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Profile Settings
                </Link>
              </div>

              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
