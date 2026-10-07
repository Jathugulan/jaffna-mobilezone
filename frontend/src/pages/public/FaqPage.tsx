import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';

interface FaqItem {
  question: string;
  answer: string;
  category: 'Products' | 'Orders' | 'Booking' | 'Payments' | 'Delivery' | 'Pickup' | 'Returns' | 'Warranty';
}

const FAQS: FaqItem[] = [
  // Products
  {
    category: 'Products',
    question: 'Are all smartphones brand new and factory-sealed?',
    answer:
      'Yes, 100% of the smartphones sold by Jaffna Mobile Zone are brand new, original sealed-box units with authentic manufacturer barcodes, tamper-evident seals, and genuine serial numbers.',
  },
  {
    category: 'Products',
    question: 'Are your devices compatible with Dialog, Mobitel, Airtel, and Hutch?',
    answer:
      'Every phone in our store is factory unlocked and fully compliant with Sri Lankan cellular standards, supporting 4G LTE and 5G bands across all local telecommunications providers.',
  },

  // Booking
  {
    category: 'Booking',
    question: 'How does phone reservation and booking work?',
    answer:
      'You can select any smartphone, choose your preferred RAM, storage capacity, and color, and book it for counter pickup or delivery. Your unit is safely reserved for 48 hours without requiring any advance payment.',
  },
  {
    category: 'Booking',
    question: 'Can I cancel or reschedule my phone booking?',
    answer:
      'Yes. If your schedule changes, you can reschedule or cancel your reservation anytime from your customer account or by texting our WhatsApp hotline with your Booking Reference ID.',
  },

  // Orders
  {
    category: 'Orders',
    question: 'How can I track the progress of my order?',
    answer:
      'Once your order is confirmed, you receive an SMS and email notification with your tracking number. You can also view step-by-step progress from Order Placed to Dispatched in your Customer Dashboard.',
  },
  {
    category: 'Orders',
    question: 'Can I make changes to my order after placing it?',
    answer:
      'If your order has not yet been packed or dispatched from our Jaffna store, you can contact our staff directly to adjust delivery details or upgrade your device variant.',
  },

  // Payments
  {
    category: 'Payments',
    question: 'What payment options do you support?',
    answer:
      'We accept Cash on Delivery (COD), Direct Bank Transfer, Visa / MasterCard credit and debit cards, and 0% installment plans through supported local bank cards.',
  },
  {
    category: 'Payments',
    question: 'Do you charge extra fees for card payments?',
    answer:
      'No. The prices listed on Jaffna Mobile Zone are all-inclusive with zero hidden surcharge fees at checkout or showroom payment counters.',
  },

  // Delivery
  {
    category: 'Delivery',
    question: 'How fast is islandwide delivery across Sri Lanka?',
    answer:
      'Orders within the Jaffna peninsula are dispatched for same-day or 24-hour delivery. For all other districts (Colombo, Kandy, Galle, Batticaloa, etc.), delivery takes 1 to 2 business days via insured express couriers.',
  },
  {
    category: 'Delivery',
    question: 'Is my phone insured during courier transit?',
    answer:
      'Yes. All mobile shipments are securely packaged in tamper-proof bubble casings and fully insured against transit damage or loss until received by you.',
  },

  // Pickup
  {
    category: 'Pickup',
    question: 'Where is your physical pickup counter located?',
    answer:
      'Our flagship showroom is located at No. 142, Hospital Road, Jaffna. You can choose "Store Pickup" during checkout or booking to test the device in person before paying.',
  },
  {
    category: 'Pickup',
    question: 'What do I need to bring when collecting my phone?',
    answer:
      'Simply bring your Booking Reference ID or order number and a photo ID matching the reservation name. Our staff will present the sealed box for your physical verification.',
  },

  // Returns
  {
    category: 'Returns',
    question: 'What is your return & exchange policy?',
    answer:
      'We offer a 7-day replacement guarantee if you discover any genuine manufacturing defects. The item must be returned with its original packaging, warranty card, and accessories.',
  },

  // Warranty
  {
    category: 'Warranty',
    question: 'What does the official warranty cover?',
    answer:
      'All smartphones include 1 to 2 Years Official Brand Warranty covering motherboard, display panel failure, internal components, and certified service center repair or replacement.',
  },
  {
    category: 'Warranty',
    question: 'How do I claim warranty if I live outside Jaffna?',
    answer:
      'You can either take your device directly to any authorized brand service center in your city (Colombo, Kandy, etc.) using your JMZ invoice, or courier it to our Jaffna hub for expedited claim handling.',
  },
];

export const FaqPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedIndices, setExpandedIndices] = useState<number[]>([0, 1]);

  const categories = [
    'All',
    'Products',
    'Booking',
    'Orders',
    'Payments',
    'Delivery',
    'Pickup',
    'Returns',
    'Warranty',
  ];

  const toggleAccordion = (idx: number) => {
    setExpandedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const filteredFaqs = FAQS.filter((f) => {
    const matchesCat = activeCategory === 'All' || f.category === activeCategory;
    const matchesSearch =
      !search.trim() ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Hero Header */}
      <div className="space-y-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-ink-2">
          <HelpCircle className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Customer Knowledge Base
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-[1.08] tracking-[-0.04em] text-ink">
          Frequently Asked <span className="grad-text">Questions</span>
        </h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-ink-3 sm:text-base">
          Clear answers about genuine sealed smartphones, booking workflows, store collection,
          islandwide transit, and warranty coverage.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-3"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Search for answers (e.g. booking, warranty, delivery time, pickup counter)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search FAQs"
          className="w-full rounded-card border border-line bg-card py-3.5 pl-12 pr-4 text-sm text-ink shadow-soft transition-all placeholder:text-ink-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Category Filter Tabs */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            aria-pressed={activeCategory === cat}
            className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all ${
              activeCategory === cat
                ? 'border-transparent bg-grad-primary text-white shadow-soft'
                : 'border-line bg-card text-ink-2 hover:border-primary/40 hover:text-ink'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQs Accordion */}
      <div className="overflow-hidden rounded-card border border-line bg-card divide-y divide-line">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedIndices.includes(idx);
            return (
              <div key={idx}>
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  aria-expanded={isExpanded}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface dark:hover:bg-elevated/60 sm:px-6"
                >
                  <span className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-3">
                      {faq.category}
                    </span>
                    <span className="text-sm font-extrabold tracking-[-0.01em] text-ink sm:text-base">
                      {faq.question}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-ink-3 transition-transform duration-300 ease-premium ${
                      isExpanded ? 'rotate-180 text-primary' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-premium ${
                    isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-line px-5 pb-5 pt-3 text-xs leading-relaxed text-ink-2 sm:px-6 sm:text-sm">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-6 py-14 text-center text-sm text-ink-3">
            No FAQ matches your search query. Try another keyword or contact us directly.
          </div>
        )}
      </div>

      {/* Direct Contact Banner */}
      <div className="rounded-hero border border-line bg-card p-8 text-center space-y-4 shadow-soft">
        <h2 className="text-xl font-extrabold tracking-[-0.03em] text-ink">
          Still Have Unanswered Questions?
        </h2>
        <p className="mx-auto max-w-md text-xs leading-relaxed text-ink-3 sm:text-sm">
          Our phone technicians in Jaffna are on standby to answer compatibility or warranty
          inquiries.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to="/contact">
            <Button variant="primary" size="md">
              Send Direct Message
            </Button>
          </Link>
          <a href="https://wa.me/94771234567" target="_blank" rel="noreferrer">
            <Button variant="outline" size="md">
              WhatsApp Support (+94 77 123 4567)
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
