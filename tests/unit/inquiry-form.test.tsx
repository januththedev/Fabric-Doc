import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InquiryForm } from "@/components/contact/inquiry-form";
import { submitInquiry } from "@/server/actions/inquiries";
import { buildInquiryMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

vi.mock("@/server/actions/inquiries", () => ({ submitInquiry: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const SERVICES = [{ title: "Sofa Deep Cleaning" }, { title: "Chair & Dining Upholstery" }];

// Radix Select needs these pointer/scroll APIs, which jsdom does not implement.
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.scrollIntoView = () => {};
});

beforeEach(() => {
  vi.clearAllMocks();
});

async function fill(phone: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Your Name"), "Kasun");
  await user.type(screen.getByLabelText("Phone / WhatsApp Number"), phone);
  await user.click(screen.getByLabelText("Service Needed"));
  await user.click(await screen.findByRole("option", { name: "Chair & Dining Upholstery" }));
  await user.type(screen.getByLabelText("City / Area"), "Kandy");
  await user.type(screen.getByLabelText("Message / Stain Details"), "Coffee stain on seat cushion");
  return user;
}

test("WhatsApp button validates synchronously and opens a formatted chat", async () => {
  const open = vi.spyOn(window, "open").mockImplementation(() => null);
  render(<InquiryForm services={SERVICES} />);
  const user = await fill("077 123 4567");

  await user.click(screen.getByRole("button", { name: "Send Directly via WhatsApp" }));

  expect(open).toHaveBeenCalledWith(
    buildWhatsAppUrl(
      buildInquiryMessage({
        name: "Kasun",
        phone: "+94771234567",
        serviceType: "Chair & Dining Upholstery",
        city: "Kandy",
        message: "Coffee stain on seat cushion",
      }),
    ),
    "_blank",
    "noopener,noreferrer",
  );
});

test("invalid phone blocks both buttons", async () => {
  const open = vi.spyOn(window, "open").mockImplementation(() => null);
  render(<InquiryForm services={SERVICES} />);
  const user = await fill("123");

  await user.click(screen.getByRole("button", { name: "Send Directly via WhatsApp" }));
  expect(await screen.findByText("Enter a valid phone number, e.g. 074 059 4100")).toBeInTheDocument();
  expect(open).not.toHaveBeenCalled();

  await user.click(screen.getByRole("button", { name: "Send Inquiry" }));
  expect(submitInquiry).not.toHaveBeenCalled();
});

test("Send Inquiry shows the confirmation panel", async () => {
  vi.mocked(submitInquiry).mockResolvedValue({ ok: true, data: undefined });
  render(<InquiryForm services={SERVICES} />);
  const user = await fill("077 123 4567");

  await user.click(screen.getByRole("button", { name: "Send Inquiry" }));

  expect(
    await screen.findByText(
      "Thanks, Kasun! We've received your inquiry and will contact you on +94771234567 shortly.",
    ),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Send another inquiry" })).toBeInTheDocument();
});
