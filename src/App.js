import React, { useState } from 'react';
import SearchForm from './components/SearchForm';
import FlightResults from './components/FlightResults';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function App() {
  const [flightData, setFlightData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchParams) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams),
      });
      if (!res.ok) throw new Error('Search failed');
      setFlightData(await res.json());
    } catch (err) {
      console.error('Search error:', err);
      setFlightData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <nav className="fc-nav">
        <a href="/" className="fc-nav-brand">
          <div className="fc-nav-mark">✈</div>
          <span className="fc-nav-name">Fare<span>Compare</span></span>
        </a>
      </nav>

      <section className="fc-hero">
        <div className="fc-aurora">
          <div className="fc-ab fc-ab-1" />
          <div className="fc-ab fc-ab-2" />
          <div className="fc-ab fc-ab-3" />
        </div>

        <div className="fc-hero-inner">
          <div className="fc-hero-text">
            <div className="fc-hero-pill">
              <div className="fc-pill-dot" />
              500+ airlines · Real-time prices
            </div>
            <h1 className="fc-hero-title">
              Search every fare.<br />
              Book the <em className="fc-italic">perfect&nbsp;flight.</em>
            </h1>
            <p className="fc-hero-sub">
              Compare prices across hundreds of airlines. No markups, no surprises.
            </p>
          </div>

          <SearchForm onSearch={handleSearch} isLoading={isLoading} />

          <div className="fc-stats">
            <div className="fc-stat">
              <div className="fc-stat-n">500+</div>
              <div className="fc-stat-l">Airlines</div>
            </div>
            <div className="fc-stat-div" />
            <div className="fc-stat">
              <div className="fc-stat-n">180</div>
              <div className="fc-stat-l">Countries</div>
            </div>
            <div className="fc-stat-div" />
            <div className="fc-stat">
              <div className="fc-stat-n">Live</div>
              <div className="fc-stat-l">Pricing</div>
            </div>
            <div className="fc-stat-div" />
            <div className="fc-stat">
              <div className="fc-stat-n">₹0</div>
              <div className="fc-stat-l">Hidden fees</div>
            </div>
          </div>
        </div>
      </section>

      {(hasSearched || isLoading) && (
        <section className="fc-results-section">
          <div className="fc-results-wrap">
            <FlightResults
              results={flightData}
              isLoading={isLoading}
              hasSearched={hasSearched}
            />
          </div>
        </section>
      )}
    </>
  );
}

export default App;
