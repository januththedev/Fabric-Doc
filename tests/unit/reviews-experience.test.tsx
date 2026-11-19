import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewsExperience } from "@/components/reviews/reviews-experience";
import { fakeMoment, fakeReview } from "./fixtures";

const make = (n: number) =>
  Array.from({ length: n }, (_, i) => fakeReview({ id: `r${i}`, reviewerName: `Reviewer ${i}` }));
const follows = (a: Element, b: Element) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

test("6 reviews: form → 4 lead → Moments → 2 more", () => {
  render(<ReviewsExperience initialReviews={make(6)} initialMoments={[fakeMoment()]} />);
  const form = screen.getByTestId("review-form-section");
  const lead = screen.getAllByTestId("lead-review");
  const moments = document.getElementById("moments")!;
  const more = screen.getByTestId("more-reviews");

  expect(lead).toHaveLength(4);
  expect(follows(form, lead[0])).toBe(true);
  expect(follows(lead[3], moments)).toBe(true);
  expect(follows(moments, more)).toBe(true);
  expect(within(more).getAllByRole("article")).toHaveLength(2);
});

test("2 reviews: no More Customer Reviews section", () => {
  render(<ReviewsExperience initialReviews={make(2)} initialMoments={[]} />);
  expect(screen.getAllByTestId("lead-review")).toHaveLength(2);
  expect(screen.queryByTestId("more-reviews")).toBeNull();
});

test("empty states", () => {
  render(<ReviewsExperience initialReviews={[]} initialMoments={[]} />);
  expect(screen.getByText("No reviews yet — be the first to share your experience.")).toBeInTheDocument();
  expect(screen.getByText("No moments yet — be the first to share a photo with your review.")).toBeInTheDocument();
});

test("Show More Reviews reveals 6 at a time", async () => {
  render(<ReviewsExperience initialReviews={make(17)} initialMoments={[]} />);
  const more = screen.getByTestId("more-reviews");
  expect(within(more).getAllByRole("article")).toHaveLength(6);

  await userEvent.click(screen.getByRole("button", { name: "Show More Reviews" }));
  expect(within(more).getAllByRole("article")).toHaveLength(12);

  await userEvent.click(screen.getByRole("button", { name: "Show More Reviews" }));
  expect(within(more).getAllByRole("article")).toHaveLength(13);
  expect(screen.queryByRole("button", { name: "Show More Reviews" })).toBeNull();
});

test("attribution pills", () => {
  render(
    <ReviewsExperience
      initialReviews={[]}
      initialMoments={[
        fakeMoment({ sourceType: "review", reviewerName: "Dilini Perera" }),
        fakeMoment({ id: "m2", sourceType: "admin", reviewerName: null, reviewId: null }),
      ]}
    />,
  );
  expect(screen.getByText("Shared by Dilini Perera")).toBeInTheDocument();
  expect(screen.getByText("Fabric Doctor Transformation")).toBeInTheDocument();
});
