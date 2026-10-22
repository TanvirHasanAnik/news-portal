import React from "react";
import { getAllAdminRequests } from "@/repositories/requestRepository";
import { getAllUsers } from "@/repositories/userRepository";
import { RequestHeader } from "./components/RequestHeader";
import { RequestManager } from "./components/RequestManager";

export default async function RequestsModule() {
  const [requests, users] = await Promise.all([
    getAllAdminRequests(),
    getAllUsers(),
  ]);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <RequestHeader pendingCount={pendingCount} />
      <RequestManager initialRequests={requests} users={users} />
    </div>
  );
}

