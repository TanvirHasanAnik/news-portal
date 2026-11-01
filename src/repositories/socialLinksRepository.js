import { queryOne, query } from "@/lib/db";

export async function getSocialLinks() {
  try {
    const row = await queryOne(
      "SELECT facebook, youtube, twitter, instagram FROM social_links WHERE id = 'default' LIMIT 1"
    );
    return {
      facebook: row?.facebook || "",
      youtube: row?.youtube || "",
      twitter: row?.twitter || "",
      instagram: row?.instagram || "",
    };
  } catch (error) {
    console.error("Failed to fetch social links:", error);
    return {
      facebook: "",
      youtube: "",
      twitter: "",
      instagram: "",
    };
  }
}

export async function updateSocialLinks({ facebook = "", youtube = "", twitter = "", instagram = "" }) {
  const cleanFacebook = (facebook || "").trim();
  const cleanYoutube = (youtube || "").trim();
  const cleanTwitter = (twitter || "").trim();
  const cleanInstagram = (instagram || "").trim();

  await query(
    `INSERT INTO social_links (id, facebook, youtube, twitter, instagram)
     VALUES ('default', ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       facebook = VALUES(facebook),
       youtube = VALUES(youtube),
       twitter = VALUES(twitter),
       instagram = VALUES(instagram),
       updated_at = CURRENT_TIMESTAMP`,
    [cleanFacebook, cleanYoutube, cleanTwitter, cleanInstagram]
  );

  return {
    facebook: cleanFacebook,
    youtube: cleanYoutube,
    twitter: cleanTwitter,
    instagram: cleanInstagram,
  };
}

