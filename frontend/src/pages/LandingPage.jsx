import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, PieChart, Smartphone, Lock, TrendingUp } from 'lucide-react';

const features = [
  { icon: Zap, title: 'Instant transfers', text: 'Move money between accounts and to anyone, anywhere, in seconds.' },
  { icon: PieChart, title: 'Spending insights', text: 'Automatic categorization shows exactly where your money goes each month.' },
  { icon: Lock, title: 'Bank-grade security', text: '256-bit encryption, account locking, and real-time fraud alerts.' },
  { icon: TrendingUp, title: 'Loans, simplified', text: 'Apply, get approved, and receive funds — without the branch visit.' },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-paper">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-navy-100 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="7" fill="#0F1F38"/>
              <path d="M16 6L27 12.5H5L16 6Z" fill="#CDA047"/>
              <rect x="7" y="14" width="3" height="11" fill="#CDA047"/>
              <rect x="14.5" y="14" width="3" height="11" fill="#CDA047"/>
              <rect x="22" y="14" width="3" height="11" fill="#CDA047"/>
              <rect x="5" y="26" width="22" height="2.5" fill="#CDA047"/>
            </svg>
            <span className="font-display text-lg font-semibold text-ink-900">DigitalBank</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost">Sign in</Link>
            <Link to="/register" className="btn-primary">Open account</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #0F1F38 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-white px-3 py-1 text-xs font-medium text-navy-600">
              <ShieldCheck className="h-3.5 w-3.5 text-sage-500" /> RBI-compliant digital banking
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] text-ink-900 sm:text-6xl">
              Your entire bank,<br />in <span className="text-gold-500">one calm screen.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-navy-500 sm:text-lg">
              Open accounts, transfer funds, apply for loans, and manage cards — all from a single dashboard built for clarity, not clutter.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary px-7 py-3 text-base">
                Open a free account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary px-7 py-3 text-base">I already bank here</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-navy-100 bg-ink-950">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
          {[
            ['250K+', 'Active customers'],
            ['₹4.2B', 'Processed monthly'],
            ['99.98%', 'Uptime'],
            ['4.9/5', 'App store rating'],
          ].map(([num, label]) => (
            <div key={label} className="text-center">
              <p className="font-display text-2xl font-semibold text-paper sm:text-3xl">{num}</p>
              <p className="mt-1 text-xs text-navy-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">Why DigitalBank</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink-900">Everything a modern account needs.</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50">
                <f.icon className="h-5 w-5 text-navy-700" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-ink-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="overflow-hidden rounded-xl2 bg-ink-950 px-8 py-14 text-center sm:px-16">
          <Smartphone className="mx-auto h-8 w-8 text-gold-400" strokeWidth={1.5} />
          <h2 className="mt-4 font-display text-2xl font-semibold text-paper sm:text-3xl">Ready to bank differently?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-navy-300">Setup takes under two minutes. No paperwork, no branch visit.</p>
          <Link to="/register" className="btn-gold mt-7 inline-flex px-7 py-3 text-base">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-navy-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-xs text-navy-400 sm:flex-row">
          <p>© {new Date().getFullYear()} DigitalBank. All rights reserved.</p>
          <p>Member FDIC-equivalent insured · Secured with 256-bit encryption</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
