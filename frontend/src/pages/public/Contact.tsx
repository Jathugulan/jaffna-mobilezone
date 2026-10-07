import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Navigation,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { StoreMap } from '../../components/common/StoreMap';

const inputClass =
  'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-xs text-ink shadow-soft transition-all placeholder:text-ink-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

const labelClass = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-ink-2';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    }, 700);
  };

  const infoCards = [
    {
      icon: MapPin,
      title: 'Showroom Address',
      lines: ['No. 142, Hospital Road, Jaffna 40000,', 'Northern Province, Sri Lanka.'],
      tone: 'bg-blue-500/10 text-primary',
    },
    {
      icon: Clock,
      title: 'Visiting & Store Hours',
      lines: ['Monday – Saturday: 9:00 AM – 8:00 PM', 'Sunday: 10:00 AM – 4:00 PM'],
      tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Phone,
      title: 'Hotline & WhatsApp',
      lines: ['Phone: +94 21 222 4567', 'WhatsApp Support: +94 77 123 4567'],
      tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    },
    {
      icon: Mail,
      title: 'Email Support',
      lines: ['General: support@jaffnamobilezone.lk', 'Corporate: b2b@jaffnamobilezone.lk'],
      tone: 'bg-rose-500/10 text-rose-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
      {/* Page Title */}
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-ink-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> Direct Showroom
          Connection
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-[1.08] tracking-[-0.04em] text-ink">
          Visit Our Jaffna Store or <span className="grad-text">Get in Touch</span>
        </h1>
        <p className="text-sm leading-relaxed text-ink-3">
          Have inquiries regarding phone availability, official warranty verification, or booking
          reservations? Our local staff is ready to help.
        </p>
      </div>

      {/* Two-Column Section: Left Store Info, Right Contact Form */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Column: Store Information */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-card p-6 sm:p-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Flagship Experience
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-ink">
              Jaffna Mobile Zone
            </h2>
            <p className="mt-1 text-xs text-ink-3">
              Hospital Road, Jaffna Peninsula, Northern Province, Sri Lanka.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=9.6647,80.0167"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-grad-primary px-4 text-xs font-bold text-white shadow-soft transition-all hover:brightness-110 active:scale-[0.98] focus-ring"
              >
                <Navigation className="h-4 w-4" />
                <span>Get Directions to Store</span>
              </a>
              <a
                href="https://wa.me/94771234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-xs font-bold text-ink-2 transition-all hover:border-emerald-500/60 hover:text-emerald-600 focus-ring"
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {infoCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="surface-card surface-card-hover rounded-card p-5 space-y-3"
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.tone}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink">
                      {card.title}
                    </h3>
                    {card.lines.map((line) => (
                      <p key={line} className="text-xs leading-relaxed text-ink-3">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 glass-card rounded-card p-6 sm:p-8">
          <div className="mb-1 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-[-0.03em] text-ink">
              Send Us a Message
            </h2>
          </div>
          <p className="mb-6 text-xs text-ink-3">
            Our Jaffna support team answers questions within 2-4 business hours.
          </p>

          {isSubmitted ? (
            <div className="space-y-4 rounded-card border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <h3 className="text-lg font-extrabold text-ink">Message Sent Successfully!</h3>
              <p className="mx-auto max-w-md text-xs leading-relaxed text-ink-2">
                Thank you for contacting Jaffna Mobile Zone. Our support team will review your
                inquiry and reach out shortly.
              </p>
              <Button size="sm" onClick={() => setIsSubmitted(false)}>
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className={labelClass}>
                    Your Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sivakumar"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className={labelClass}>
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sivakumar@gmail.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-phone" className={labelClass}>
                    Phone / WhatsApp *
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="contact-subject" className={labelClass}>
                    Subject *
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. S26 Ultra stock or Booking inquiry"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className={labelClass}>
                  Your Message *
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what smartphone or assistance you need..."
                  className={`${inputClass} resize-y`}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Section: Leaflet + OpenStreetMap StoreMap */}
      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Find Us on the Map
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-ink">
            Jaffna Showroom Location
          </h2>
        </div>

        <StoreMap height="460px" showDetailsCard={true} />
      </div>
    </div>
  );
};

export default Contact;
