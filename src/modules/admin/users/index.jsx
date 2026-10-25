import React from "react";
import { getAllUsers } from "@/repositories/userRepository";
import { UserHeader } from "./components/UserHeader";
import { UserManager } from "./components/UserManager";

export default async function UsersModule() {
  let users = [];
  try {
    users = (await getAllUsers()) || [];
  } catch (err) {
    console.error("[UsersModule error]:", err);
  }

  return (
    <div className="space-y-6">
      <UserHeader userCount={users.length} />
      <UserManager initialUsers={users} />
    </div>
  );
}
