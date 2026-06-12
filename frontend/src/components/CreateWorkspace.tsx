"use client";

import { useState } from "react";
import { api } from "../services/api";

export default function CreateWorkspace() {
  const [name, setName] = useState("");

  const createWorkspace = async () => {
    try {
      await api.post("/workspaces", {
        name,
      });

      setName("");

      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder="Workspace Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 mr-2 rounded"
      />

      <button
        onClick={createWorkspace}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Create Workspace
      </button>
    </div>
  );
}