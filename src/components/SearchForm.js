import React, { useState, useRef, useCallback } from 'react';
import Autosuggest from 'react-autosuggest';
import './SearchForm.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const today = new Date().toISOString().split('T')[0];
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

const AUTOSUGGEST_THEME = {
  container:              'sf-ac-container',
  input:                  'sf-ac-input',
  suggestionsContainer:   'sf-ac-dropdown',
  suggestionsContainerOpen: 'sf-ac-dropdown--open',
  suggestionsList:        'sf-ac-list',
  suggestion:             'sf-ac-item',
  suggestionHighlighted:  'sf-ac-item--hl',
};

function SearchForm({ onSearch, isLoading }) {
  const [originIatas, setOriginIatas]       = useState([]);
  const [destinations, setDestinations]     = useState([]);
  const [originInput, setOriginInput]       = useState('');
  const [destInput, setDestInput]           = useState('');
  const [originSuggs, setOriginSuggs]       = useState([]);
  const [destSuggs, setDestSuggs]           = useState([]);
  const [dateFrom, setDateFrom]             = useState(today);
  const [dateTo, setDateTo]                 = useState(nextWeek);
  const [isReturn, setIsReturn]             = useState(false);
  const [nights, setNights]                 = useState(7);
  const [maxStops, setMaxStops]             = useState(3);

  const originRef = useRef(null);
  const destRef   = useRef(null);
  const originTimer = useRef(null);
  const destTimer   = useRef(null);

  const fetchSuggs = useCallback((query, setter, timerRef) => {
    clearTimeout(timerRef.current);
    if (query.length < 3) { setter([]); return; }
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/autosuggest?search_text=${encodeURIComponent(query)}`
        );
        if (res.ok) setter(await res.json());
      } catch {}
    }, 300);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!originIatas.length && !destinations.length) return;
    onSearch({
      origins:      originIatas,
      destinations,
      dateFrom,
      dateTo,
      nights:       isReturn ? nights : 0,
      maxStops,
    });
  };

  const removeOrigin = (iata, e) => {
    e.stopPropagation();
    setOriginIatas(prev => prev.filter(o => o !== iata));
  };

  const removeDest = (code, e) => {
    e.stopPropagation();
    setDestinations(prev => prev.filter(d => d !== code));
  };

  return (
    <form className="sf-panel" onSubmit={handleSubmit}>
      {/* Trip type toggle */}
      <div className="sf-trip-row">
        <button
          type="button"
          className={`sf-trip-btn${!isReturn ? ' sf-trip-btn--active' : ''}`}
          onClick={() => setIsReturn(false)}
        >
          One Way
        </button>
        <button
          type="button"
          className={`sf-trip-btn${isReturn ? ' sf-trip-btn--active' : ''}`}
          onClick={() => setIsReturn(true)}
        >
          Return
        </button>
      </div>

      {/* Input row */}
      <div className="sf-row">

        {/* Origins */}
        <div className="sf-field">
          <div className="sf-label">From</div>
          <div
            className="sf-box"
            onClick={() => originRef.current?.input?.focus()}
          >
            {originIatas.map(code => (
              <span key={code} className="sf-tag">
                {code}
                <span className="sf-tag-x" onClick={(e) => removeOrigin(code, e)}>×</span>
              </span>
            ))}
            <Autosuggest
              ref={originRef}
              theme={AUTOSUGGEST_THEME}
              suggestions={originSuggs}
              onSuggestionsFetchRequested={({ value }) =>
                fetchSuggs(value, setOriginSuggs, originTimer)
              }
              onSuggestionsClearRequested={() => setOriginSuggs([])}
              getSuggestionValue={s => s.iata}
              renderSuggestion={s => <span>{s.dropdown}</span>}
              onSuggestionSelected={(_, { suggestion }) => {
                if (!originIatas.includes(suggestion.iata)) {
                  setOriginIatas(prev => [...prev, suggestion.iata]);
                }
                setOriginInput('');
              }}
              inputProps={{
                value: originInput,
                onChange: (_, { newValue }) => setOriginInput(newValue),
                placeholder: '+ Add airport',
              }}
            />
          </div>
        </div>

        {/* Destinations */}
        <div className="sf-field">
          <div className="sf-label">To</div>
          <div
            className="sf-box"
            onClick={() => destRef.current?.input?.focus()}
          >
            {destinations.map(code => (
              <span key={code} className="sf-tag">
                {code}
                <span className="sf-tag-x" onClick={(e) => removeDest(code, e)}>×</span>
              </span>
            ))}
            <Autosuggest
              ref={destRef}
              theme={AUTOSUGGEST_THEME}
              suggestions={destSuggs}
              onSuggestionsFetchRequested={({ value }) =>
                fetchSuggs(value, setDestSuggs, destTimer)
              }
              onSuggestionsClearRequested={() => setDestSuggs([])}
              getSuggestionValue={s => s.iata}
              renderSuggestion={s => <span>{s.dropdown}</span>}
              onSuggestionSelected={(_, { suggestion }) => {
                if (!destinations.includes(suggestion.iata)) {
                  setDestinations(prev => [...prev, suggestion.iata]);
                }
                setDestInput('');
              }}
              inputProps={{
                value: destInput,
                onChange: (_, { newValue }) => setDestInput(newValue),
                placeholder: '+ Add city or airport',
              }}
            />
          </div>
        </div>

        {/* Depart */}
        <div className="sf-field sf-field--narrow">
          <div className="sf-label">Depart</div>
          <div className="sf-box sf-box--mono">
            <input
              type="date"
              value={dateFrom}
              min={today}
              onChange={e => setDateFrom(e.target.value)}
            />
          </div>
        </div>

        {/* Date To */}
        <div className="sf-field sf-field--narrow">
          <div className="sf-label">{isReturn ? 'Return by' : 'Search until'}</div>
          <div className="sf-box sf-box--mono">
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              onChange={e => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {/* Max stops */}
        <div className="sf-field sf-field--narrow">
          <div className="sf-label">Max stops</div>
          <div className="sf-box sf-box--mono">
            <select
              value={maxStops}
              onChange={e => setMaxStops(Number(e.target.value))}
            >
              <option value={3}>Any</option>
              <option value={0}>Direct</option>
              <option value={1}>1 stop</option>
              <option value={2}>2 stops</option>
            </select>
          </div>
        </div>

        {/* Search button */}
        <div className="sf-btn-wrap">
          <button
            type="submit"
            className="sf-search-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="sf-spinner" />
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            )}
            {isLoading ? 'Searching…' : 'Search'}
          </button>
        </div>

      </div>

      {/* Nights (return only) */}
      {isReturn && (
        <div className="sf-nights-row">
          <div className="sf-field" style={{ maxWidth: 190 }}>
            <div className="sf-label">Nights at destination</div>
            <div className="sf-box sf-box--mono">
              <input
                type="number"
                value={nights}
                min={1}
                max={90}
                onChange={e => setNights(Number(e.target.value) || 1)}
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

export default SearchForm;
