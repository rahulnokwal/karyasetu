import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { WorkspaceRole } from "../../constants";
import {
  FolderKanban,
  CheckSquare,
  Activity,
  ChevronDown,
  LayoutDashboard,
  Plus,
  Settings,
  Users,
  UserPlus,
  Building2,
  Check,
} from "lucide-react";
import { CreateWorkspaceModal } from "../workspace/CreateWorkspaceModal";
import { WorkspaceSettingsModal } from "../workspace/WorkspaceSettingsModal";
import { InviteMemberModal } from "../workspace/InviteMemberModal";
import { WorkspaceMembersModal } from "../workspace/WorkspaceMembersModal";
import { Badge } from "../common/Badge";

export function Sidebar() {
  const { workspaces, currentWorkspace, setCurrentWorkspace, currentRole } =
    useWorkspaceStore();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  const isAdminOrOwner =
    currentRole === WorkspaceRole.OWNER || currentRole === WorkspaceRole.ADMIN;

  const navLinks = [
    { to: "/workspace", label: "Overview", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/my-tasks", label: "My Tasks", icon: CheckSquare },
    { to: "/activity", label: "Activity", icon: Activity },
  ];

  return (
    <>
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 select-none">
        <div className="p-4 border-b border-slate-100 relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200/80 shadow-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left truncate">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {currentWorkspace?.workspaceName || "Select Workspace"}
                </p>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                  {currentRole || "Workspace"}
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute left-4 right-4 top-20 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-30 divide-y divide-slate-100 max-h-80 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Your Workspaces
                </div>
                <div className="py-1">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.workspaceId}
                      onClick={() => {
                        setCurrentWorkspace(ws);
                        setIsDropdownOpen(false);
                        navigate("/workspace");
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 transition-colors text-left"
                    >
                      <span className="font-medium text-slate-700 truncate">
                        {ws.workspaceName}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="default" className="text-[10px]">
                          {ws.role}
                        </Badge>
                        {ws.workspaceId === currentWorkspace?.workspaceId && (
                          <Check className="w-4 h-4 text-indigo-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowCreateModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Workspace
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </NavLink>
            );
          })}

          <div className="pt-4 pb-1">
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Workspace
            </p>
          </div>

          <button
            onClick={() => setShowMembersModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
          >
            <Users className="w-4 h-4" />
            Members
          </button>

          {isAdminOrOwner && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
            >
              <UserPlus className="w-4 h-4" />
              Invite Teammates
            </button>
          )}

          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </nav>
      </aside>

      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <WorkspaceSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        workspace={currentWorkspace}
      />
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        workspaceId={currentWorkspace?.workspaceId}
      />
      <WorkspaceMembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        workspaceId={currentWorkspace?.workspaceId}
      />
    </>
  );
}
