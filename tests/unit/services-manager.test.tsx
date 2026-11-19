import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ServicesManager } from "@/components/admin/services-manager";
import {
  createService,
  deleteService,
  moveService,
  setServiceActive,
  updateService,
} from "@/server/actions/services";
import { fakeService } from "./fixtures";

vi.mock("@/server/actions/services", () => ({
  createService: vi.fn(),
  updateService: vi.fn(),
  deleteService: vi.fn(),
  moveService: vi.fn(),
  setServiceActive: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const list = [
  fakeService({ id: "s1", title: "Sofa Deep Cleaning", sortOrder: 1 }),
  fakeService({ id: "s2", title: "Mattress Sanitization", slug: "mattress-cleaning", sortOrder: 2, isActive: false }),
];

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
});

test("lists services and marks hidden ones", () => {
  render(<ServicesManager services={list} />);
  expect(screen.getByText("Sofa Deep Cleaning")).toBeInTheDocument();
  expect(within(screen.getByTestId("service-row-s2")).getByText("Hidden")).toBeInTheDocument();
});

test("the first Up and the last Down buttons are disabled", () => {
  render(<ServicesManager services={list} />);
  expect(screen.getByRole("button", { name: "Move Sofa Deep Cleaning up" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Move Mattress Sanitization down" })).toBeDisabled();
});

test("Add service validates, then creates with highlights split by line", async () => {
  vi.mocked(createService).mockResolvedValue({ ok: true, data: fakeService() });
  render(<ServicesManager services={list} />);

  await userEvent.click(screen.getByRole("button", { name: "Add service" }));
  await userEvent.click(screen.getByRole("button", { name: "Save service" }));
  expect(await screen.findByText("Please enter a service name.")).toBeInTheDocument();
  expect(createService).not.toHaveBeenCalled();

  await userEvent.type(screen.getByLabelText("Service name"), "Curtain Cleaning");
  await userEvent.type(screen.getByLabelText("Short description"), "Gentle steam cleaning for curtains.");
  await userEvent.type(screen.getByLabelText("Highlights (one per line, up to 5)"), "Dust removal{enter}Fabric-safe");
  await userEvent.click(screen.getByRole("button", { name: "Save service" }));

  await waitFor(() =>
    expect(createService).toHaveBeenCalledWith({
      title: "Curtain Cleaning",
      shortDesc: "Gentle steam cleaning for curtains.",
      highlights: ["Dust removal", "Fabric-safe"],
      imageUrl: null,
      removeImage: false,
      isActive: true,
    }),
  );
});

test("Edit pre-fills the form and calls updateService", async () => {
  vi.mocked(updateService).mockResolvedValue({ ok: true, data: list[0] });
  render(<ServicesManager services={list} />);

  await userEvent.click(screen.getByRole("button", { name: "Edit Sofa Deep Cleaning" }));
  const name = screen.getByLabelText("Service name");
  expect(name).toHaveValue("Sofa Deep Cleaning");

  await userEvent.clear(name);
  await userEvent.type(name, "Sofa & Couch Cleaning");
  await userEvent.click(screen.getByRole("button", { name: "Save service" }));

  await waitFor(() =>
    expect(updateService).toHaveBeenCalledWith("s1", expect.objectContaining({ title: "Sofa & Couch Cleaning" })),
  );
});

test("a server error stays in the dialog", async () => {
  vi.mocked(createService).mockResolvedValue({ ok: false, error: "A service with this title already exists." });
  render(<ServicesManager services={list} />);
  await userEvent.click(screen.getByRole("button", { name: "Add service" }));
  await userEvent.type(screen.getByLabelText("Service name"), "Sofa Deep Cleaning");
  await userEvent.type(screen.getByLabelText("Short description"), "Deep extraction and stain removal.");
  await userEvent.click(screen.getByRole("button", { name: "Save service" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("A service with this title already exists.");
});

test("delete needs confirmation and says reviews are kept", async () => {
  vi.mocked(deleteService).mockResolvedValue({ ok: true, data: undefined });
  render(<ServicesManager services={list} />);

  await userEvent.click(screen.getByRole("button", { name: "Delete Sofa Deep Cleaning" }));
  expect(screen.getByRole("alertdialog")).toHaveTextContent("Existing reviews keep this service name.");
  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(deleteService).not.toHaveBeenCalled();

  await userEvent.click(screen.getByRole("button", { name: "Delete Sofa Deep Cleaning" }));
  await userEvent.click(screen.getByRole("button", { name: "Delete" }));
  await waitFor(() => expect(deleteService).toHaveBeenCalledWith("s1"));
});

test("the visibility switch and the move buttons call their actions", async () => {
  vi.mocked(setServiceActive).mockResolvedValue({ ok: true, data: undefined });
  vi.mocked(moveService).mockResolvedValue({ ok: true, data: undefined });
  render(<ServicesManager services={list} />);

  await userEvent.click(screen.getByRole("switch", { name: "Show Sofa Deep Cleaning on the website" }));
  expect(setServiceActive).toHaveBeenCalledWith("s1", false);

  await userEvent.click(screen.getByRole("button", { name: "Move Sofa Deep Cleaning down" }));
  expect(moveService).toHaveBeenCalledWith("s1", "down");
});

test("empty state", () => {
  render(<ServicesManager services={[]} />);
  expect(screen.getByText("No services yet — add your first service.")).toBeInTheDocument();
});
