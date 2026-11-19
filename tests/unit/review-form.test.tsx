import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { ReviewForm } from "@/components/reviews/review-form";
import { prepareImageForUpload, uploadImage } from "@/lib/upload";
import { submitReview } from "@/server/actions/reviews";
import { fakeMoment, fakeReview } from "./fixtures";

const SERVICES = [{ title: "Sofa Deep Cleaning" }, { title: "Mattress Sanitization" }];
const BLOB = "https://abc.public.blob.vercel-storage.com/reviews/0b6f2f8e-3c1a-4c55-9a43-1f2d3e4f5a6b.jpg";

vi.mock("@/server/actions/reviews", () => ({ submitReview: vi.fn() }));
vi.mock("@/lib/upload", async (original) => ({
  ...(await original<typeof import("@/lib/upload")>()),
  prepareImageForUpload: vi.fn(),
  uploadImage: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

async function fillValid() {
  await userEvent.type(screen.getByLabelText("Your Name"), "Dilini Perera");
  await userEvent.type(screen.getByLabelText("Your Review"), "Spotless sofa, thank you!");
}
async function attachPhoto() {
  const input = screen.getByLabelText("Add a Photo (optional)");
  await userEvent.upload(input, new File(["x"], "photo.jpg", { type: "image/jpeg" }));
  await screen.findByRole("button", { name: "Remove photo" });
}

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
});

test("rating defaults to 5", () => {
  render(<ReviewForm services={SERVICES} onSubmitted={vi.fn()} />);
  expect(screen.getByRole("radio", { name: "5 stars" })).toBeChecked();
});

test("validation blocks an empty submit", async () => {
  render(<ReviewForm services={SERVICES} onSubmitted={vi.fn()} />);
  await userEvent.click(screen.getByRole("button", { name: "Submit Review" }));
  expect(await screen.findByText("Please enter your name.")).toBeInTheDocument();
  expect(screen.getByText("Please write at least 10 characters.")).toBeInTheDocument();
  expect(submitReview).not.toHaveBeenCalled();
});

test("a double click submits once and disables the button", async () => {
  let resolve!: (v: unknown) => void;
  vi.mocked(submitReview).mockReturnValue(new Promise((r) => (resolve = r)) as never);
  render(<ReviewForm services={SERVICES} onSubmitted={vi.fn()} />);
  await fillValid();
  await userEvent.dblClick(screen.getByRole("button", { name: "Submit Review" }));
  expect(submitReview).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: /Submitting/ })).toBeDisabled();
  resolve({ ok: true, data: { review: fakeReview(), moment: null } });
});

test("success: callback, toast and reset", async () => {
  const review = fakeReview({ reviewerName: "Dilini Perera" });
  vi.mocked(submitReview).mockResolvedValue({ ok: true, data: { review, moment: null } });
  const onSubmitted = vi.fn();
  render(<ReviewForm services={SERVICES} onSubmitted={onSubmitted} />);
  await fillValid();
  await userEvent.click(screen.getByRole("button", { name: "Submit Review" }));
  await waitFor(() => expect(onSubmitted).toHaveBeenCalledWith(review, null));
  expect(toast.success).toHaveBeenCalledWith("Thank you, Dilini! Your review is now live.");
  expect(screen.getByLabelText("Your Name")).toHaveValue("");
});

test("save fails after the upload: the photo is kept and the retry reuses the uploaded url", async () => {
  vi.mocked(prepareImageForUpload).mockResolvedValue({ ok: true, file: new File(["x"], "p.jpg", { type: "image/jpeg" }) });
  vi.mocked(uploadImage).mockResolvedValue({ url: BLOB });
  vi.mocked(submitReview)
    .mockResolvedValueOnce({ ok: false, error: "Something went wrong. Please try again." })
    .mockResolvedValueOnce({ ok: true, data: { review: fakeReview(), moment: fakeMoment() } });

  render(<ReviewForm services={SERVICES} onSubmitted={vi.fn()} />);
  await fillValid();
  await attachPhoto();
  await userEvent.click(screen.getByRole("button", { name: "Submit Review" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");
  expect(screen.getByRole("button", { name: "Remove photo" })).toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: "Submit Review" }));
  await waitFor(() => expect(submitReview).toHaveBeenCalledTimes(2));
  expect(uploadImage).toHaveBeenCalledTimes(1);
  expect(vi.mocked(submitReview).mock.calls[1][0].imageUrl).toBe(BLOB);
});

test("an unsupported photo shows its error and is not attached", async () => {
  vi.mocked(prepareImageForUpload).mockResolvedValue({ ok: false, reason: "too-large" });
  render(<ReviewForm services={SERVICES} onSubmitted={vi.fn()} />);
  await userEvent.upload(screen.getByLabelText("Add a Photo (optional)"), new File(["x"], "big.jpg", { type: "image/jpeg" }));
  expect(await screen.findByText("That photo is too large. Please choose one under 25 MB.")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Remove photo" })).toBeNull();
});

test("without services the form cannot be submitted", () => {
  render(<ReviewForm services={[]} onSubmitted={vi.fn()} />);
  expect(screen.getByRole("button", { name: "Submit Review" })).toBeDisabled();
  expect(screen.getByText("Reviews are temporarily unavailable.")).toBeInTheDocument();
});
