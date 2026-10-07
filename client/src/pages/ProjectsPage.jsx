import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWorkspaceStore } from "../store/workspaceStore";
import { projectApi } from "../api/projectApi";
import { WorkspaceRole } from "../constants";
import { Button } from "../components/common/Button";
import { CreateProjectModal } from "../components/project/CreateProjectModal";
import {
  FolderKanban,
  Plus,
  Search,
  Users,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export function ProjectsPage() {
  const { currentWorkspace, currentRole } = useWorkspaceStore();
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canCreateProject =
    currentRole === WorkspaceRole.OWNER || currentRole === WorkspaceRole.ADMIN;

  const loadProjects = async () => {
    if (!currentWorkspace?.workspaceId) return;
    setIsLoading(true);
    try {
      const response = await projectApi.getWorkspaceProjects(
        currentWorkspace.workspaceId,
      );
      setProjects(response.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [currentWorkspace?.workspaceId]);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Projects
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Projects within <strong>{currentWorkspace?.workspaceName}</strong>
          </p>
        </div>

        {canCreateProject && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Project
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter projects by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
        />
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : !currentWorkspace?.workspaceId ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              No workspace selected
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Select or create a workspace from the Overview page to view its
              projects.
            </p>
          </div>
          <Link to="/workspace">
            <Button variant="secondary">Go to Workspace Overview</Button>
          </Link>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              No projects found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {searchQuery
                ? "No projects match your query. Try a different search term."
                : canCreateProject
                  ? "Get started by creating your first project board in this workspace."
                  : "No projects assigned to you in this workspace yet. Ask a workspace admin to add you to a project."}
            </p>
          </div>
          {canCreateProject && !searchQuery && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className="group bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  {project.myRoleInProject && (
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      {project.myRoleInProject}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {project.description || "No project description provided."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs text-slate-400 font-medium group-hover:text-indigo-600 transition-colors">
                <span>View Kanban Board</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        workspaceId={currentWorkspace?.workspaceId}
        onProjectCreated={(newProject) =>
          setProjects((prev) => [newProject, ...prev])
        }
      />
    </div>
  );
}
