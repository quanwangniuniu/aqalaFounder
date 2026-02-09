/**
 * Upload a profile image via the Next.js API route (same backend as web)
 * Uses expo-image-picker result URIs
 */

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || "";

export async function uploadProfileImage(userId: string, imageUri: string): Promise<string> {
  // Get the file name and type from the URI
  const filename = imageUri.split("/").pop() || "profile.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  // Create FormData with the image
  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    name: filename,
    type,
  } as any);
  formData.append("userId", userId);

  const response = await fetch(`${WEB_URL}/api/upload`, {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(error.error || "Failed to upload image");
  }

  const result = await response.json();
  return result.url;
}
