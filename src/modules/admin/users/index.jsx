import React from "react";
import { getPaginatedUsers, getUsersCount } from "@/repositories/userRepository";
import { UserHeader } from "./components/UserHeader";
import { UserManager } from "./components/UserManager";

export default async function UsersModule({ searchParams }) {
  const resolvedParams = searchParams ? await searchParams : {};
  const page = Math.max(1, parseInt(resolvedParams?.page || "1", 10));
  const role = resolvedParams?.role || "all";
  const search = resolvedParams?.q || "";
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let users = [];
  let totalUsers = 0;
  try {
    const [paginatedUsers, count] = await Promise.all([
      getPaginatedUsers({ limit: pageSize, offset, role, search }),
      getUsersCount({ role, search }),
    ]);
    users = paginatedUsers || [];
    totalUsers = count || 0;
  } catch (err) {
    console.error("[UsersModule error]:", err);
  }

  return (
    <div className="space-y-6">
      <UserHeader userCount={totalUsers} />
      <UserManager
        initialUsers={users}
        currentPage={page}
        pageSize={pageSize}
        totalCount={totalUsers}
        initialRole={role}
        initialSearchQuery={search}
      />
    </div>
  );
}
