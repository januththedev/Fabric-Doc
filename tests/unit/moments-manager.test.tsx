import { render, screen } from "@testing-library/react";
import { MomentsManager } from "@/components/admin/moments-manager";
import { fakeMoment } from "./fixtures";

vi.mock("@/server/actions/admin", () => ({ createAdminMoments: vi.fn(), deleteMoment: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

test("badges distinguish admin and guest photos", () => {
  render(
    <MomentsManager
      moments={[
        fakeMoment({ sourceType: "admin", reviewerName: null, reviewId: null }),
        fakeMoment({ id: "m2", sourceType: "review", reviewerName: "Dilini Perera" }),
      ]}
    />,
  );
  expect(screen.getByText("Admin Upload")).toBeInTheDocument();
  expect(screen.getByText("Guest Review: Dilini Perera")).toBeInTheDocument();
});

test("empty gallery explains itself", () => {
  render(<MomentsManager moments={[]} />);
  expect(screen.getByText("No moments yet.")).toBeInTheDocument();
});
