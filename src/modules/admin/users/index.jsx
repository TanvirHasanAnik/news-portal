import React from "react";
import { getAllUsers } from "@/repositories/userRepository";
import { UserHeader } from "./components/UserHeader";
import { UserManager } from "./components/UserManager";

export default async function UsersModule() {
  const users = await getAllUsers();

  return (
    <div className="space-y-6">
      <UserHeader userCount={users.length} />
      <UserManager initialUsers={users} />
    </div>
  );
}

