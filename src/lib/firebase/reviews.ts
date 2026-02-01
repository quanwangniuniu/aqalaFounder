import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

const COLLECTION = "reviews";

export type Review = {
  id: string;
  name?: string;
  email?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date | null;
};

function ensureDb() {
  if (!db) {
    throw new Error("Firestore is not initialized on the server side.");
  }
  return db;
}

export async function submitReview(reviewData: {
  name?: string;
  email?: string;
  rating: number;
  comment: string;
}): Promise<void> {
  const firestore = ensureDb();
  
  // Validate required fields
  if (!reviewData.comment || reviewData.comment.trim() === "") {
    throw new Error("Comment is required");
  }
  if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  await addDoc(collection(firestore, COLLECTION), {
    name: reviewData.name?.trim() || null,
    email: reviewData.email?.trim() || null,
    rating: reviewData.rating,
    comment: reviewData.comment.trim(),
    createdAt: serverTimestamp(),
  });
}

