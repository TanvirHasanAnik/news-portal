import { getCurrentUser } from "@/lib/auth/server";
import { ProfileForm } from "./components/ProfileForm";

export default async function ProfileModule({ currentUser }) {
  const user = currentUser || (await getCurrentUser());

  if (!user) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        প্রোফাইল তথ্য লোড করা যায়নি। অনুগ্রহ করে পুনরায় লগইন করুন।
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileForm user={user} />
    </div>
  );
}

