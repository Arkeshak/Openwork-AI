"use client";

import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Workspace } from "../types/workspace";
import Link from "next/link";

export default function WorkspaceList() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await api.get("/workspaces");

        setWorkspaces(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  if (loading) {
    return <p>Loading workspaces...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        Workspaces
      </h2>

      {workspaces.length === 0 ? (
        <p>No workspaces found</p>
      ) : (
        workspaces.map((workspace) => (
          <Link
            key={workspace.id}
            href={`/workspace/${workspace.id}`}
          >
            <div className="border p-4 mb-3 rounded cursor-pointer hover:bg-gray-100">
              {workspace.name}
            </div>
          </Link>
        ))
      )}
    </div>
  );
}