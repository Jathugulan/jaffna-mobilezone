import React from 'react';
import { Shield, FileText, RefreshCw, Truck } from 'lucide-react';

interface PolicyShellProps {
  icon: React.ReactNode;
  title: string;
  meta: string;
  children: React.ReactNode;
}

/* Shared calm, prose-like shell so every policy page reads consistently. */
const PolicyShell: React.FC<PolicyShellProps> = ({ icon, title, meta, children }) => (
  <div className="mx-auto max-w-3xl animate-fade-up space-y-6 px-4 py-10 sm:px-6 lg:px-8">
    <header className="flex items-start gap-4 border-b border-line pb-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-primary">
        {icon}
      </span>
      <div>
        <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-ink sm:text-3xl">{title}</h1>
        <p className="mt-1 text-xs text-ink-3">{meta}</p>
      </div>
    </header>

    <article className="surface-card space-y-6 p-6 text-sm leading-relaxed text-ink-2 sm:p-8 sm:text-[15px]">
      {children}
    </article>
  </div>
);

interface PolicySectionProps {
  title: string;
  children: React.ReactNode;
}

const PolicySection: React.FC<PolicySectionProps> = ({ title, children }) => (
  <section className="space-y-2">
    <h2 className="text-lg font-extrabold tracking-[-0.02em] text-ink">{title}</h2>
    <p>{children}</p>
  </section>
);

export const PrivacyPolicy: React.FC = () => {
  return (
    <PolicyShell icon={<Shield className="h-6 w-6" />} title="Privacy Policy" meta="Last updated: September 2026">
      <PolicySection title="1. Information We Collect">
        At Jaffna Mobile Zone, we collect personal information such as your name, email address,
        phone number, and physical shipping address solely to process and deliver your smartphone
        orders safely.
      </PolicySection>

      <PolicySection title="2. Grounded AI & Data Privacy">
        Conversations with our AI Assistants (Customer Shopping Advisor and Order Tracking Copilot)
        are processed to deliver relevant phone recommendations and order updates. We do not sell
        your personal data or query history to third-party advertisers.
      </PolicySection>

      <PolicySection title="3. Payment Security">
        Payment transactions made on Jaffna Mobile Zone utilize standard end-to-end encryption.
        Sensitive payment details (e.g. credit card CVV) are never stored on our servers.
      </PolicySection>

      <PolicySection title="4. Cookies & Session Storage">
        We use essential cookies and browser storage to maintain your active shopping cart, compare
        drawer list, and secure authentication tokens across visits.
      </PolicySection>
    </PolicyShell>
  );
};

export const TermsOfService: React.FC = () => {
  return (
    <PolicyShell
      icon={<FileText className="h-6 w-6" />}
      title="Terms of Service"
      meta="Last updated: September 2026"
    >
      <PolicySection title="1. Acceptance of Terms">
        By accessing or ordering from Jaffna Mobile Zone, you agree to comply with our purchasing
        policies, TRCSL consumer protection guidelines, and standard retail regulations within Sri
        Lanka.
      </PolicySection>

      <PolicySection title="2. Product Descriptions & Pricing">
        All smartphone specifications, storage tiers, colors, and prices in Sri Lankan Rupees (LKR)
        are accurate at the time of publication. We reserve the right to correct typographical
        pricing errors before order fulfillment.
      </PolicySection>

      <PolicySection title="3. Order Confirmation & Fulfillment">
        Orders placed via cash on delivery or online payment are confirmed following telephone
        verification by our customer dispatch team in Jaffna.
      </PolicySection>
    </PolicyShell>
  );
};

export const WarrantyReturns: React.FC = () => {
  return (
    <PolicyShell
      icon={<RefreshCw className="h-6 w-6" />}
      title="Warranty & Returns Policy"
      meta="Official Protection & Guarantee"
    >
      <PolicySection title="1. Official Hardware Warranty">
        All phones sold include standard 1 to 2 Years Hardware &amp; Motherboard Warranty and 6
        months battery and accessories warranty backed by authorized brand service centers in Sri
        Lanka.
      </PolicySection>

      <PolicySection title="2. 7-Day Replacement Guarantee">
        If a phone exhibits manufacturer hardware defects upon unboxing, customers may request a
        direct one-to-one replacement within 7 calendar days of receipt.
      </PolicySection>

      <PolicySection title="3. Exclusions from Warranty">
        Physical drops, liquid ingress (water damage), unauthorized third-party repairs, bootloader
        modifications (rooting), and accidental screen cracks are not covered under manufacturer
        warranty.
      </PolicySection>
    </PolicyShell>
  );
};

export const ShippingPolicy: React.FC = () => {
  return (
    <PolicyShell
      icon={<Truck className="h-6 w-6" />}
      title="Shipping & Island-Wide Delivery"
      meta="Doorstep delivery across all 25 districts"
    >
      <PolicySection title="1. Jaffna Peninsula Delivery">
        Orders within Jaffna city and peninsula locations (Chavakachcheri, Point Pedro, Valvettithurai,
        Chunnakam, Nallur, etc.) are delivered within 24 hours.
      </PolicySection>

      <PolicySection title="2. Island-Wide Delivery">
        Deliveries to Colombo, Kandy, Galle, Gampaha, Kurunegala, Batticaloa, Trincomalee, and other
        provinces take between 1 to 3 business days via verified express couriers with real-time
        tracking numbers.
      </PolicySection>

      <PolicySection title="3. Free Shipping Eligibility">
        Orders totaling LKR 100,000 or higher qualify for free insured delivery anywhere across Sri
        Lanka.
      </PolicySection>
    </PolicyShell>
  );
};
