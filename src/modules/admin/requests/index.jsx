import React from "react";
import { getAllAdminRequests } from "@/repositories/requestRepository";
import { getAllUsers } from "@/repositories/userRepository";
import { RequestHeader } from "./components/RequestHeader";
import { RequestManager } from "./components/RequestManager";

export default async function RequestsModule() {
  let requests = [];
  let users = [];

  try {
    const [reqs, usrs] = await Promise.all([
      getAllAdminRequests(),
      getAllUsers(),
    ]);
    requests = reqs || [];
    users = usrs || [];
  } catch (err) {
    console.error("[RequestsModule error]:", err);
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <RequestHeader pendingCount={pendingCount} />
      <RequestManager initialRequests={requests} users={users} />
    </div>
  );
}
