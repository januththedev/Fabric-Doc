import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewsTable } from "@/components/admin/reviews-table";
import { deleteReview } from "@/server/actions/admin";
import { fakeReview } from "./fixtures";

vi.mock("@/server/actions/admin", () => ({ deleteReview: vi.fn().mockResolvedValue({ ok: true, data: undefined }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const rows = [
  fakeReview({ id: "1", reviewerName: "Kasun", serviceType: "Sofa Deep Cleaning" }),
  fakeReview({ id: "2", reviewerName: "Dilini", serviceType: "Mattress Sanitization" }),
  fakeReview({ id: "3", reviewerName: "Ayesha", serviceType: "Carpet & Rug Cleaning" }),
];

beforeEach(() => {
  vi.mocked(deleteReview).mockResolvedValue({ ok: true, data: undefined });
});

test("search filters by name, comment or service", async () => {
  render(<ReviewsTable reviews={rows} />);
  await userEvent.type(screen.getByRole("searchbox", { name: "Search reviews" }), "mattress");
  expect(screen.getAllByTestId("review-row")).toHaveLength(1);
  expect(screen.getByText("Dilini")).toBeInTheDocument();
});

test("delete requires confirmation", async () => {
  render(<ReviewsTable reviews={rows} />);
  await userEvent.click(screen.getByRole("button", { name: "Delete review by Kasun" }));
  expect(screen.getByRole("alertdialog")).toHaveTextContent("Delete this review?");

  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(deleteReview).not.toHaveBeenCalled();

  await userEvent.click(screen.getByRole("button", { name: "Delete review by Kasun" }));
  await userEvent.click(screen.getByRole("button", { name: "Delete" }));
  await waitFor(() => expect(deleteReview).toHaveBeenCalledWith("1"));
});
