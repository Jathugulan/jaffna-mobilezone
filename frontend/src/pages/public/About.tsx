import React from 'react';
import {
  ShieldCheck,
  Truck,
  Sparkles,
  HeartHandshake,
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  BookmarkCheck,
  Quote,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  const pillars = [
    {
      icon: ShieldCheck,
      title: '100% Genuine Sealed',
      desc: 'Every device is factory-sealed with verified serial numbers and official Sri Lankan distributor warranty cards.',
      tone: 'bg-blue-500/10 text-primary',
    },
    {
      icon: BookmarkCheck,
      title: 'Smart Variant Booking',
      desc: 'Reserve specific RAM, storage capacities, and rare colors ahead of time. Inspect the box in person before paying.',
      tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    },
    {
      icon: Truck,
      title: 'Insured Islandwide Delivery',
      desc: 'Express insured courier service delivering safely across all 25 Sri Lankan districts within 24 to 48 hours.',
      tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: HeartHandshake,
      title: 'Hands-on Local Support',
      desc: 'Speak directly with real phone technicians in Jaffna via WhatsApp or visit our counter for data migration and setup.',
      tone: 'bg-rose-500/10 text-rose-500',
    },
  ];

  const chapters = [
    {
      index: '01 · ORIGIN',
      title: 'Our Story',
      body: 'Starting as a specialized mobile boutique in Jaffna town, we recognized customers needed genuine manufacturer-sealed devices, zero gray-market confusion, and transparent pricing. Today, we serve thousands of smartphone buyers locally and islandwide.',
    },
    {
      index: '02 · PURPOSE',
      title: 'Our Mission',
      body: 'To provide reliable access to official flagship mobile technology with manufacturer warranty backing, instant variant reservation, verified specs, and exceptional post-sales customer care.',
    },
    {
      index: '03 · HORIZON',
      title: 'Our Vision',
      body: "To be Sri Lanka's most trusted technology retail platform combining a state-of-the-art physical showroom experience in Jaffna with seamless digital commerce and fast, safe islandwide delivery.",
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Phones Handed Over', accent: true },
    { value: '100%', label: 'Original Sealed Units', accent: false },
    { value: '4.9 / 5', label: 'Customer Satisfaction', accent: true },
    { value: '25', label: 'Districts Islandwide', accent: false },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden rounded-hero border border-line bg-card shadow-card">
        <div className="aurora-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative z-10 p-8 sm:p-14 lg:p-20">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-ink-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Jaffna&apos;s Premier Technology Platform
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-[-0.04em] text-ink">
              Power Your Next Move with{' '}
              <span className="grad-text">Genuine Technology.</span>
            </h1>
            <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-ink-2">
              Founded in the heart of Jaffna on Hospital Road, Jaffna Mobile Zone bridges Northern
              Sri Lanka with the world&apos;s leading mobile technology brands—delivering 100%
              factory-sealed smartphones, certified warranties, and flexible reservation options.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/shop">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Explore Smartphones
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Visit Showroom
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OUR STORY, MISSION & VISION */}
      <section className="space-y-10">
        <div className="max-w-2xl space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
            Who We Are
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold leading-[1.1] tracking-[-0.03em] text-ink">
            A Northern Sri Lankan retailer built on trust.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {chapters.map((chapter) => (
            <article
              key={chapter.index}
              className="surface-card surface-card-hover rounded-card p-8 space-y-4"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                {chapter.index}
              </span>
              <h3 className="text-xl font-extrabold tracking-[-0.03em] text-ink">
                {chapter.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-2">{chapter.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 3. CORE PILLARS: WHY JAFFNA MOBILE ZONE */}
      <section className="space-y-10">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
            Uncompromising Standards
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold leading-[1.1] tracking-[-0.03em] text-ink">
            What Sets Our Store Apart
          </h2>
          <p className="text-sm leading-relaxed text-ink-3">
            Four pillars behind every sealed box we hand over — from our Hospital Road counter to
            your doorstep.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.title}
                className="surface-card surface-card-hover rounded-card p-6 space-y-4"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${pillar.tone}`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="text-base font-extrabold tracking-[-0.02em] text-ink">
                  {pillar.title}
                </h3>
                <p className="text-xs leading-relaxed text-ink-3">{pillar.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* 4. SHOWROOM & PHYSICAL EXPERIENCE */}
      <section className="grid grid-cols-1 items-center gap-8 rounded-hero border border-line bg-card p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
        <div className="space-y-5">
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
            Jaffna Showroom Experience
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold leading-[1.1] tracking-[-0.03em] text-ink">
            Touch, Test &amp; Verify Before You Buy
          </h2>
          <p className="text-sm leading-relaxed text-ink-2">
            Our Hospital Road showroom offers a relaxed, premium environment. Test the dynamic 120Hz
            display refresh rates, feel the titanium ergonomic chassis, and verify benchmark
            performance with our store advisers.
          </p>

          <div className="space-y-3 pt-2 text-sm text-ink-2">
            <p className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-primary">
                <MapPin className="h-4 w-4" />
              </span>
              <span>No. 142, Hospital Road, Jaffna, Sri Lanka</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Clock className="h-4 w-4" />
              </span>
              <span>Open Monday – Saturday: 9:00 AM – 8:00 PM</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Phone className="h-4 w-4" />
              </span>
              <span>Direct Phone: +94 21 222 4567 / WhatsApp: +94 77 123 4567</span>
            </p>
          </div>

          <div className="pt-3">
            <Link to="/contact">
              <Button variant="primary" size="md">
                Store Map &amp; Directions
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-card border border-line bg-elevated">
          <img
            src="https://images.unsplash.com/photo-1556742049-0a67c5574f73?q=80&w=800&auto=format&fit=crop"
            alt="Jaffna Mobile Zone Flagship Showroom"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* 5. PULL QUOTE */}
      <section className="mx-auto max-w-4xl text-center space-y-6">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-grad-primary text-white shadow-soft">
          <Quote className="h-5 w-5" />
        </span>
        <blockquote className="text-xl sm:text-3xl font-extrabold leading-[1.35] tracking-[-0.03em] text-ink">
          “Every phone we hand over is{' '}
          <span className="grad-text">factory-sealed, warranty-backed and verified in front of you</span>
          — because trust is the only spec you cannot upgrade later.”
        </blockquote>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-ink-3">
          Jaffna Mobile Zone · Hospital Road, Jaffna
        </p>
      </section>

      {/* 6. STATS SUMMARY */}
      <section className="rounded-hero border border-line bg-card p-8 sm:p-12">
        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1.5">
              <p
                className={`font-heading text-3xl sm:text-4xl font-extrabold tracking-[-0.04em] ${
                  stat.accent ? 'grad-text' : 'text-ink'
                }`}
              >
                {stat.value}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-3">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CTA BLOCK */}
      <section className="relative overflow-hidden rounded-hero bg-grad-primary p-8 sm:p-14 text-center text-white shadow-premium">
        <div className="mx-auto max-w-2xl space-y-5">
          <h2 className="text-2xl sm:text-4xl font-extrabold leading-[1.1] tracking-[-0.03em]">
            Ready to upgrade with confidence?
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-white/85">
            Browse sealed flagships online, reserve your exact variant, or walk into our Jaffna
            showroom and inspect the box yourself.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/shop"
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-white px-6 text-base font-semibold tracking-[-0.01em] text-blue-700 shadow-soft transition-all duration-150 hover:brightness-105 active:scale-[0.98] focus-ring"
            >
              Shop Latest Flagships
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/40 bg-transparent px-6 text-base font-semibold tracking-[-0.01em] text-white transition-all duration-150 hover:bg-white/10 active:scale-[0.98] focus-ring"
            >
              Book a Showroom Visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
