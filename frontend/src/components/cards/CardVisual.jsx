import { Wifi } from 'lucide-react';

const networkLogos = { visa: 'VISA', mastercard: 'Mastercard', rupay: 'RuPay' };

const CardVisual = ({ card }) => {
  const isBlocked = card.status === 'blocked';
  return (
    <div className={`relative aspect-[1.586/1] w-full overflow-hidden rounded-2xl p-5 text-paper shadow-card-hover transition-opacity ${isBlocked ? 'opacity-60 grayscale' : ''} ${card.cardType === 'credit' ? 'bg-gradient-to-br from-ink-950 via-navy-900 to-ink-900' : 'bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900'}`}>
      <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-gold-400/10" />
      <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-paper/5" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-navy-300">DigitalBank</p>
            <p className="mt-0.5 text-xs font-medium capitalize text-navy-200">{card.cardType} {card.isVirtualCard ? '· Virtual' : ''}</p>
          </div>
          <Wifi className="h-5 w-5 rotate-90 text-navy-300" />
        </div>
        <div>
          <p className="font-mono text-lg tracking-[0.15em] sm:text-xl">{card.maskedCardNumber}</p>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-[9px] uppercase text-navy-400">Card holder</p>
              <p className="text-xs font-medium uppercase tracking-wide sm:text-sm">{card.cardholderName}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-navy-400">Expires</p>
              <p className="text-xs font-medium sm:text-sm">{String(card.expiryMonth).padStart(2, '0')}/{String(card.expiryYear).slice(-2)}</p>
            </div>
            <p className="font-display text-base italic text-gold-400 sm:text-lg">{networkLogos[card.cardNetwork]}</p>
          </div>
        </div>
      </div>
      {isBlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-950/40">
          <span className="rounded-full bg-rust-500 px-3 py-1 text-xs font-semibold">BLOCKED</span>
        </div>
      )}
    </div>
  );
};

export default CardVisual;
