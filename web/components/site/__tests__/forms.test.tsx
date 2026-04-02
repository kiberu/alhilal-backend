import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ConsultationForm, GuideRequestForm } from "@/components/site/forms";
import { createWebsiteLead } from "@/lib/leads";
import { trackLeadState } from "@/lib/gtag";

jest.mock("@/lib/leads", () => ({
  createWebsiteLead: jest.fn(),
}));

jest.mock("@/lib/gtag", () => ({
  analyticsEventNames: {
    leadSubmitStarted: "lead_submit_started",
    leadSubmitSucceeded: "lead_submit_succeeded",
    leadSubmitFailed: "lead_submit_failed",
  },
  trackLeadState: jest.fn(),
}));

describe("website forms", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submits consultation forms with the structured enquiry payload and shows success state", async () => {
    const user = userEvent.setup();
    (createWebsiteLead as jest.Mock).mockResolvedValueOnce({ id: "lead-1" });

    render(<ConsultationForm source="contact" contextLabel="contact_consultation" tripId="trip-1" tripName="January Umrah 2027" />);

    await user.type(screen.getByLabelText(/full name/i), "Amina");
    await user.type(screen.getByLabelText(/phone or whatsapp/i), "+256700111111");
    await user.type(screen.getByLabelText(/email address/i), "amina@example.com");
    await user.type(screen.getByLabelText(/preferred travel window/i), "January 2027");
    await user.type(screen.getByLabelText(/what would you like help with/i), "Looking for a family-friendly option.");
    await user.click(screen.getByRole("button", { name: /request follow-up/i }));

    await waitFor(() => {
      expect(createWebsiteLead).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Amina",
          phone: "+256700111111",
          interestType: "CONSULTATION",
          source: "contact",
          contextLabel: "contact_consultation",
          ctaLabel: "consultation_form_submit",
          tripId: "trip-1",
        }),
      );
    });

    expect(trackLeadState).toHaveBeenNthCalledWith(
      1,
      "lead_submit_started",
      expect.objectContaining({
        source: "contact",
        contextLabel: "contact_consultation",
      }),
    );
    expect(trackLeadState).toHaveBeenNthCalledWith(
      2,
      "lead_submit_succeeded",
      expect.objectContaining({
        interestType: "CONSULTATION",
      }),
    );
    expect(await screen.findByText(/consultation request is saved/i)).toBeInTheDocument();
  });

  it("shows guide request errors and dispatches failure tracking", async () => {
    const user = userEvent.setup();
    (createWebsiteLead as jest.Mock).mockRejectedValueOnce(new Error("Please try again tomorrow."));

    render(<GuideRequestForm source="guidance_hub" contextLabel="guidance_hub_planning_guide" />);

    await user.type(screen.getByLabelText(/full name/i), "Mariam");
    await user.type(screen.getByLabelText(/email address/i), "mariam@example.com");
    await user.click(screen.getByRole("button", { name: /request the planning guide/i }));

    expect(await screen.findByText(/please try again tomorrow/i)).toBeInTheDocument();
    expect(trackLeadState).toHaveBeenNthCalledWith(
      1,
      "lead_submit_started",
      expect.objectContaining({
        source: "guidance_hub",
        interestType: "GUIDE_REQUEST",
      }),
    );
    expect(trackLeadState).toHaveBeenNthCalledWith(
      2,
      "lead_submit_failed",
      expect.objectContaining({
        contextLabel: "guidance_hub_planning_guide",
      }),
    );
  });
});
