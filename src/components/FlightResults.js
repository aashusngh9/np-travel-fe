import React, { useState } from 'react';

/* Consistent badge color per airline name */
const BADGE_COLORS = [
  'linear-gradient(135deg,#1e3a8a,#2563eb)',
  'linear-gradient(135deg,#7c2d12,#c2410c)',
  'linear-gradient(135deg,#14532d,#15803d)',
  'linear-gradient(135deg,#4a044e,#7e22ce)',
  'linear-gradient(135deg,#881337,#be123c)',
  'linear-gradient(135deg,#0c4a6e,#0369a1)',
  'linear-gradient(135deg,#713f12,#a16207)',
  'linear-gradient(135deg,#1c1917,#44403c)',
];

function badgeColor(name) {
  if (!name) return BADGE_COLORS[0];
  const h = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return BADGE_COLORS[h % BADGE_COLORS.length];
}

function badgeInitials(name) {
  if (!name) return '??';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/* ── Skeleton ── */
function SkeletonCard() {
  return (
    <div className="fc-skel-card">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="fc-sk fc-sk--circle" style={{ width: 44, height: 44 }} />
        <div className="fc-sk" style={{ height: 13, width: 100 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="fc-sk" style={{ height: 26, width: '100%' }} />
        <div className="fc-sk" style={{ height: 11, width: '55%' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
        <div className="fc-sk" style={{ height: 26, width: 120 }} />
        <div className="fc-sk" style={{ height: 38, width: 118, borderRadius: 9 }} />
      </div>
    </div>
  );
}

/* ── Flight card ── */
function FlightCard({ result }) {
  const [open, setOpen] = useState(false);

  const airlineName = Array.isArray(result.airline) ? result.airline[0] : result.airline;
  const onwardRoutes = result.routes.filter(r => r.isReturn === 0);
  const returnRoutes = result.routes.filter(r => r.isReturn === 1);
  const stops = result.stops ?? (onwardRoutes.length > 1 ? onwardRoutes.length - 1 : 0);

  /* Through-city label for 1-stop */
  const throughCity = stops > 0 && onwardRoutes.length > 1
    ? onwardRoutes[0].cityTo
    : null;

  const price = result.price.toLocaleString('en-IN');

  return (
    <div className={`fc-card${open ? ' fc-card--open' : ''}`}>
      <div className="fc-card--main" onClick={() => setOpen(o => !o)}>

        {/* Airline */}
        <div className="fc-airline-col">
          <div className="fc-airline-badge" style={{ background: badgeColor(airlineName) }}>
            {badgeInitials(airlineName)}
          </div>
          <div className="fc-airline-nm">{airlineName}</div>
        </div>

        {/* Route timeline */}
        <div className="fc-route-tl">
          <div className="fc-tl-end">
            <div className="fc-tl-time">{result.departure_time}</div>
            <div className="fc-tl-city">{result.origin_city}</div>
          </div>

          <div className="fc-tl-connector">
            <div className="fc-tl-track">
              {stops > 0 && <div className="fc-stop-dot" style={{ left: '50%' }} />}
              <span className="fc-tl-plane">✈</span>
            </div>
            {stops === 0
              ? <span className="fc-stop-pill fc-stop-pill--direct">Non-stop</span>
              : (
                <span className="fc-stop-pill">
                  {stops} stop{stops > 1 ? 's' : ''}
                  {throughCity ? ` · ${throughCity}` : ''}
                </span>
              )
            }
          </div>

          <div className="fc-tl-end fc-tl-end--right">
            <div className="fc-tl-time">{result.arrival_time}</div>
            <div className="fc-tl-city">{result.destination_city}</div>
          </div>
        </div>

        {/* Price + book */}
        <div className="fc-price-col">
          <div>
            <div className="fc-price-num">
              <span className="fc-price-cur">₹</span>{price}
            </div>
            <div className="fc-price-pp">per person</div>
          </div>
          {result.link && (
            <a
              href={result.link}
              target="_blank"
              rel="noopener noreferrer"
              className="fc-book-btn"
              onClick={e => e.stopPropagation()}
            >
              Book Now →
            </a>
          )}
        </div>

        {/* Expand toggle */}
        <div className="fc-expand-col">
          <div className="fc-expand-chevron">▾</div>
        </div>
      </div>

      {open && (
        <div className="fc-card-details">
          {onwardRoutes.length > 0 && (
            <div className="fc-leg-block">
              <div className="fc-leg-hd fc-leg-hd--out">
                <div className="fc-leg-dot" />
                Outbound
                {onwardRoutes[0]?.local_departure_date ? ` · ${onwardRoutes[0].local_departure_date}` : ''}
              </div>
              {onwardRoutes.map((route, i) => (
                <div key={i} className="fc-leg-item">
                  <div className="fc-leg-info">
                    <div className="fc-leg-cities">{route.cityFrom} → {route.cityTo}</div>
                    <div className="fc-leg-airline">{route.airline}</div>
                  </div>
                  <div className="fc-leg-times">
                    {route.local_departure} – {route.local_arrival}
                  </div>
                </div>
              ))}
            </div>
          )}

          {returnRoutes.length > 0 && (
            <div className="fc-leg-block">
              <div className="fc-leg-hd fc-leg-hd--ret">
                <div className="fc-leg-dot" />
                Return
                {returnRoutes[0]?.local_departure_date ? ` · ${returnRoutes[0].local_departure_date}` : ''}
              </div>
              {returnRoutes.map((route, i) => (
                <div key={i} className="fc-leg-item">
                  <div className="fc-leg-info">
                    <div className="fc-leg-cities">{route.cityFrom} → {route.cityTo}</div>
                    <div className="fc-leg-airline">{route.airline}</div>
                  </div>
                  <div className="fc-leg-times">
                    {route.local_departure} – {route.local_arrival}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main component ── */
function FlightResults({ results, isLoading, hasSearched }) {
  if (isLoading) {
    return (
      <div className="fc-skel-list">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (hasSearched && results.length === 0) {
    return (
      <div className="fc-empty">
        <svg className="fc-empty-icon" width="88" height="88" viewBox="0 0 88 88" fill="none">
          <circle cx="44" cy="44" r="42" stroke="#94a3b8" strokeWidth="2"/>
          <path d="M22 50 L44 20 L66 50" stroke="#94a3b8" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="44" y1="20" x2="44" y2="62" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="33" y1="38" x2="22" y2="46" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
          <line x1="55" y1="38" x2="66" y2="46" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
          <line x1="28" y1="66" x2="60" y2="66" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <div className="fc-empty-title">No flights found</div>
        <div className="fc-empty-body">
          Try adjusting your dates, origins, or destinations to find more options.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fc-results-hd">
        <div>
          <div className="fc-results-title">{results.length} flights found</div>
          <div className="fc-results-sub">Sorted by price · 1 adult</div>
        </div>
      </div>
      <div className="fc-results-list">
        {results.map(result => (
          <FlightCard key={result.id} result={result} />
        ))}
      </div>
    </>
  );
}

export default FlightResults;
