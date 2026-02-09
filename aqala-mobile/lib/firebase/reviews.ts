import { apiFetch } from "@/utils/api";

export type Review = {
    id: string;
    name?: string;
    email?: string;
    rating: number;
    comment: string;
    createdAt: Date | null;
};

export async function submitReview(reviewData: {
    name?: string;
    email?: string;
    rating: number;
    comment: string;
}): Promise<void> {
    if (!reviewData.comment || reviewData.comment.trim() === "") {
        throw new Error("Comment is required");
    }
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error("Rating must be between 1 and 5");
    }

    const response = await apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
            name: reviewData.name,
            email: reviewData.email,
            rating: reviewData.rating,
            comment: reviewData.comment,
        }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit review");
    }
}
