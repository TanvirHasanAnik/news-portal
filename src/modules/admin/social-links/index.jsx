import React from "react";
import { getSocialLinks } from "@/repositories/socialLinksRepository";
import { SocialLinksHeader } from "./components/SocialLinksHeader";
import { SocialLinksManager } from "./components/SocialLinksManager";

export default async function SocialLinksModule() {
  let socialLinks = {
    facebook: "",
    youtube: "",
    twitter: "",
    instagram: "",
  };

  try {
    socialLinks = await getSocialLinks();
  } catch (error) {
    console.error("Error loading social links module:", error);
  }

  return (
    <div className="space-y-6">
      <SocialLinksHeader />
      <SocialLinksManager initialLinks={socialLinks} />
    </div>
  );
}

