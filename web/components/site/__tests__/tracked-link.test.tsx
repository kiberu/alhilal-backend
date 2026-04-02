import { fireEvent, render, screen } from "@testing-library/react";

import { TrackedLink } from "@/components/site/tracked-link";
import { trackCtaClick } from "@/lib/gtag";

jest.mock("@/lib/gtag", () => ({
  trackCtaClick: jest.fn(),
}));

describe("TrackedLink", () => {
  it("dispatches a canonical CTA event when clicked", () => {
    render(
      <TrackedLink href="/contact" eventName="cta_contact_click" ctaLabel="contact_cta" contextLabel="homepage">
        Talk to Al Hilal
      </TrackedLink>,
    );

    fireEvent.click(screen.getByRole("link", { name: /talk to al hilal/i }));

    expect(trackCtaClick).toHaveBeenCalledWith(
      "cta_contact_click",
      expect.objectContaining({
        pagePath: "/",
        contextLabel: "homepage",
        ctaLabel: "contact_cta",
        destination: "/contact",
      }),
    );
  });
});
