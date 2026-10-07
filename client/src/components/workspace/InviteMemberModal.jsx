import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { workspaceApi } from "../../api/workspaceApi";
import { WorkspaceRole } from "../../constants";
import { toast } from "sonner";

export function InviteMemberModal({ isOpen, onClose, workspaceId }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(WorkspaceRole.MEMBER);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await workspaceApi.sendInvitation(workspaceId, email.trim(), role);
      toast.success(`Invitation email sent to ${email}`);
      setEmail("");
      setRole(WorkspaceRole.MEMBER);
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team Member"
      description="Send an email invitation to join this workspace."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="colleague@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={WorkspaceRole.MEMBER}>
              Member (Standard access)
            </option>
            <option value={WorkspaceRole.ADMIN}>
              Admin (Manage projects & members)
            </option>
          </select>
          <p className="text-xs text-slate-500 mt-1">
            Note: The user must verify their email before they can accept the
            workspace invitation.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
