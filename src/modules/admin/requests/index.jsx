import React from "react";
import {
  getAllAdminRequests,
  getAdminRequestsCount,
} from "@/repositories/requestRepository";
import { getAllUsers } from "@/repositories/userRepository";
import { RequestHeader } from "./components/RequestHeader";
import { RequestManager } from "./components/RequestManager";

export default async function RequestsModule({ searchParams }) {
  const resolvedParams = searchParams ? await searchParams : {};
  const page = Math.max(1, parseInt(resolvedParams?.page || "1", 10));
  const status = resolvedParams?.status || "all";
  const search = resolvedParams?.q || "";
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let requests = [];
  let totalRequests = 0;
  let pendingCount = 0;
  let users = [];

  try {
    const [reqs, totalReqs, pendingReqsCount, usrs] = await Promise.all([
      getAllAdminRequests({ status, search, limit: pageSize, offset }),
      getAdminRequestsCount({ status, search }),
      getAdminRequestsCount({ status: "pending" }),
      getAllUsers(),
    ]);
    requests = reqs || [];
    totalRequests = totalReqs || 0;
    pendingCount = pendingReqsCount || 0;
    users = usrs || [];
  } catch (err) {
    console.error("[RequestsModule error]:", err);
  }

  return (
    <div className="space-y-6">
      <RequestHeader pendingCount={pendingCount} />
      <RequestManager
        initialRequests={requests}
        users={users}
        currentPage={page}
        pageSize={pageSize}
        totalCount={totalRequests}
        initialStatus={status}
        initialSearchQuery={search}
      />
    </div>
  );
}
