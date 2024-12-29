import React, { useState, useCallback, useRef } from "react";
import Autosuggest from "react-autosuggest";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./SearchForm.css"; // Import the CSS file for styling
import moment from "moment"; // Import moment for date manipulation

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_URL = `${API_BASE_URL}/countries/autosuggest`;
const ORIGINS_API_URL = `${API_BASE_URL}/airports/autosuggest`;

function SearchForm({ onSearch }) {
  const [origins, setOrigins] = useState("");
  const [destinations, setDestinations] = useState([]);
  const [destinationInput, setDestinationInput] = useState("");
  const [dateFrom, setDateFrom] = useState(new Date()); // Set default to current date
  const [dateTo, setDateTo] = useState(new Date());
  const [suggestions, setSuggestions] = useState([]);
  const [originIatas, setOriginIatas] = useState([]);
  const [originInput, setOriginInput] = useState("");
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [isReturnFlight, setIsReturnFlight] = useState(false);
  const [nights, setNights] = useState(0);
  const [loading, setLoading] = useState(false); // Loading state
  const originAutosuggestRef = useRef(null); // Ref for the origin Autosuggest
  const destinationAutosuggestRef = useRef(null); // Ref for the destination Autosuggest
const [maxStops, setMaxStops] = useState(0); // New state for max stops

  // Utility function to handle preventDefault and stopPropagation
  const preventEventPropagation = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Debounce function to delay API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(null, args);
      }, delay);
    };
  };

  // Fetch origin suggestions from API
  const fetchOriginSuggestions = useCallback(
    debounce(async (query) => {
      try {
        const response = await fetch(`${ORIGINS_API_URL}?airport_name=${query}`);
        if (!response.ok) {
          throw new Error("Failed to fetch origin suggestions");
        }
        const data = await response.json();
        setOriginSuggestions(data);
        destinationAutosuggestRef.current.showSuggestions(); // Show the dropdown
      } catch (error) {
        console.error("Error fetching origin suggestions:", error);
      }
    }, 300),
    []
  );

  // Fetch destination suggestions from API
  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      try {
        const response = await fetch(`${API_URL}?country_name=${query}`);
        if (!response.ok) {
          throw new Error("Failed to fetch suggestions");
        }
        const data = await response.json();
        setSuggestions(data);
        destinationAutosuggestRef.current.showSuggestions(); // Show the dropdown
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    }, 300),
    []
  );

  // Handle origin suggestions request
  const handleOriginSuggestionsFetchRequested = ({ value }) => {
    if (value.length > 3) {
      fetchOriginSuggestions(value);
      originAutosuggestRef.current.input.focus(); // Focus the input field
    }
  };

  // Handle origin input change
  const handleOriginInputChange = (event, { newValue }) => {
    setOriginInput(newValue);
  };

  // Add origin to the list
  const handleAddOrigin = (event, { suggestion }) => {
    const originIata = suggestion.iata;
    if (!originIatas.includes(originIata)) {
      setOriginIatas([...originIatas, originIata]);
    }
    setOriginInput('');
  };

  // Remove origin from the list
  const handleRemoveOrigin = (iata) => {
    setOriginIatas(originIatas.filter((origin) => origin !== iata));
  };

  // Handle destination suggestions request
  const handleSuggestionsFetchRequested = ({ value }) => {
    if (value.length > 3) {
      fetchSuggestions(value);
      destinationAutosuggestRef.current.input.focus(); // Focus the input field
    }
  };

  // Handle destination input change
  const handleDestinationChange = (event, { newValue }) => {
    setDestinationInput(newValue);
  };

  // Add destination to the list
  const handleAddDestination = (event, { suggestion }) => {
    const destinationCode = suggestion.code;
    if (!destinations.includes(destinationCode)) {
      setDestinations([...destinations, destinationCode]);
    }
    setDestinationInput('');
  };

  // Remove destination from the list
  const handleRemoveDestination = (destination) => {
    setDestinations(destinations.filter((dest) => dest !== destination));
  };

  const handleSubmit = async (e) => {
    preventEventPropagation(e); // Prevent event propagation
    setLoading(true);  // Start loading when the form is submitted

    const formattedDateFrom = moment(dateFrom).format("YYYY-MM-DD");
    const formattedDateTo = moment(dateTo).format("YYYY-MM-DD");

    await onSearch({
      origins: originIatas,
      destinations,
      dateFrom: formattedDateFrom,
      dateTo: formattedDateTo,
      nights: isReturnFlight ? nights : 0,
      maxStops, // Include maxStops in the payload
    });

    setLoading(false);  // Stop loading once the search completes
  };

  return (
    <form
      onSubmit={handleSubmit}
      onTouchStart={(e) => preventEventPropagation(e)} // Prevent touch event propagation
      className="p-4 bg-light rounded"
    >
      {/* Autosuggest for Origins */}
      <div className="mb-3">
        <label htmlFor="origins" className="form-label">Origins:</label>
        <div className="d-flex">
          <Autosuggest
            ref={originAutosuggestRef}
            suggestions={originSuggestions}
            onSuggestionsFetchRequested={handleOriginSuggestionsFetchRequested}
            onSuggestionsClearRequested={() => setOriginSuggestions([])}
            getSuggestionValue={(suggestion) => suggestion.iata}
            renderSuggestion={(suggestion) => <div>{suggestion.dropdown}</div>}
            inputProps={{
              placeholder: "Type an origin",
              value: originInput,
              onChange: handleOriginInputChange,
            }}
            onSuggestionSelected={handleAddOrigin}
          />
        </div>
        {/* Display selected origins with remove option */}
        <div className="selected-origins">
          {originIatas.map((origin) => (
            <span key={origin} className="origin-tag">
              {origin}{" "}
              <button
                type="button"
                className="btn-close btn-close-small"
                onClick={(e) => { handleRemoveOrigin(origin); preventEventPropagation(e); }}
              />
            </span>
          ))}
        </div>
      </div>

      {/* Autosuggest for Destinations */}
      <div className="mb-3">
        <label htmlFor="destinations" className="form-label">Destinations:</label>
        <div className="d-flex">
          <Autosuggest
            ref={destinationAutosuggestRef}
            suggestions={suggestions}
            onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
            onSuggestionsClearRequested={() => setSuggestions([])}
            getSuggestionValue={(suggestion) => suggestion.name}
            renderSuggestion={(suggestion) => <div>{suggestion.name}</div>}
            inputProps={{
              placeholder: "Type a destination",
              value: destinationInput,
              onChange: handleDestinationChange,
            }}
            onSuggestionSelected={handleAddDestination}
          />
        </div>

        {/* Display selected destinations with remove option */}
        <div className="selected-destinations">
          {destinations.map((destination) => (
            <span key={destination} className="destination-tag">
              {destination}{" "}
              <button
                type="button"
                className="btn-close btn-close-small"
                onClick={(e) => { handleRemoveDestination(destination); preventEventPropagation(e); }}
              />
            </span>
          ))}
        </div>
      </div>

      {/* Date Pickers */}
      <div className="mb-3">
        <label htmlFor="departureDate" className="form-label">Date From:</label>
        <DatePicker
          id="departureDate"
          selected={dateFrom}
          onChange={(date) => setDateFrom(date)}
          className="form-control"
          dateFormat="yyyy-MM-dd"
          minDate={new Date()}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="returnDate" className="form-label">Date To:</label>
        <DatePicker
          id="returnDate"
          selected={dateTo}
          onChange={(date) => setDateTo(date)}
          className="form-control"
          dateFormat="yyyy-MM-dd"
          minDate={dateFrom}
        />
      </div>

      <div className="mb-3">
      <label htmlFor="maxStops" className="form-label">Max Stops:</label>
      <input
        type="number"
        id="maxStops"
        value={maxStops}
        onChange={(e) => setMaxStops(parseInt(e.target.value, 10) || 3)}
        className="form-control"
        placeholder="Enter maximum stops"
      />
    </div>
      {/* Toggle for Return Flight */}
      <div className="mb-3 form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          id="returnFlightToggle"
          checked={isReturnFlight}
          onChange={(e) => setIsReturnFlight(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="returnFlightToggle">Return Flight</label>
      </div>

      {/* Conditional Input for Nights */}
      {isReturnFlight && (
        <div className="mb-3">
          <label htmlFor="nights" className="form-label">Nights:</label>
          <input
            type="number"
            id="nights"
            value={nights}
            onChange={(e) => setNights(parseInt(e.target.value, 10) || 0)}
            className="form-control"
          />
        </div>
      )}

      {/* Show loading indicator if loading is true */}
      {loading ? (
        <div className="loading-indicator">Loading...</div>
      ) : (
        <button type="submit" className="btn btn-primary">Search Flights</button>
      )}
    </form>
  );
}

export default SearchForm;
