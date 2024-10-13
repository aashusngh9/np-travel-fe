import React, { useState } from 'react';
import Autosuggest from 'react-autosuggest';
import 'bootstrap/dist/css/bootstrap.min.css';


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_URL = `${API_BASE_URL}/countries/autosuggest`;
const ORIGINS_API_URL = `${API_BASE_URL}/airports/autosuggest`;
// Example API endpoint (replace with your actual endpoint)
//const API_URL = 'https://ec2-13-51-234-10.eu-north-1.compute.amazonaws.com/countries/autosuggest';
//const ORIGINS_API_URL = 'https://ec2-13-51-234-10.eu-north-1.compute.amazonaws.com/airports/autosuggest';

function SearchForm({ onSearch }) {
  const [origins, setOrigins] = useState('');
  const [destinations, setDestinations] = useState([]); // To store the selected destination codes
  const [destinationInput, setDestinationInput] = useState(''); // User input for destination
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [suggestions, setSuggestions] = useState([]); // List of suggestions from API
  const [originIatas, setOriginIatas] = useState([]); // To store the selected origin iata codes
  const [originInput, setOriginInput] = useState(''); // User input for origin
  const [originSuggestions, setOriginSuggestions] = useState([]); // Suggestions for origins
  const [isReturnFlight, setIsReturnFlight] = useState(false); // State for toggle
  const [nights, setNights] = useState(0); // State for nights input


    // Fetch origin suggestions from API
const fetchOriginSuggestions = async (query) => {
  try {
    const response = await fetch(`${ORIGINS_API_URL}?airport_name=${query}`);
    if (!response.ok) {
      throw new Error('Failed to fetch origin suggestions');
    }
    const data = await response.json();
    setOriginSuggestions(data);
  } catch (error) {
    console.error('Error fetching origin suggestions:', error);
  }
};

const handleOriginInputChange = (event, { newValue }) => {
    setOriginInput(newValue);
  };

const handleAddOrigin = (event, { suggestion }) => {
    const originIata = suggestion.iata;
    if (!originIatas.includes(originIata)) {
      setOriginIatas([...originIatas, originIata]);
    }
    setOriginInput('');
  };

const handleOriginSuggestionsFetchRequested = ({ value }) => {
    if (value.length > 3) {
      fetchOriginSuggestions(value);
    }
  };

  const handleOriginSuggestionsClearRequested = () => {
    setOriginSuggestions([]);
  };

  // When suggestion is selected, update originInput
  const handleOriginSuggestionSelected = (event, { suggestion, method }) => {
    if (method === 'enter') {
      // If Enter is pressed, keep the current input
      setOriginInput(originInput);
    } else {
      // Otherwise, use the suggestion value
      setOriginInput(suggestion);
    }
  };

  // Fetch suggestions from API
  const fetchSuggestions = async (query) => {
    try {
      const response = await fetch(`${API_URL}?country_name=${query}`);
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      const data = await response.json();
      setSuggestions(data); // API returns an array of objects like {code, name}
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSuggestionsFetchRequested = ({ value }) => {
    if (value.length > 3) {
      fetchSuggestions(value);
    }
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const handleDestinationChange = (event, { newValue }) => {
    setDestinationInput(newValue);
  };

  // Add the selected destination's code to the list
  const handleAddDestination = (event, { suggestion }) => {
    const destinationCode = suggestion.code;
    if (!destinations.includes(destinationCode)) {
      setDestinations([...destinations, destinationCode]); // Add code to the destinations array
    }
    setDestinationInput(''); // Clear input after adding
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      origins: originIatas,
      destinations,
      dateFrom,
      dateTo,
      nights: isReturnFlight ? nights : 0, // Send nights only if return flight
    });
  };

  // Define how each suggestion should be displayed (show the 'name')
  const renderSuggestion = (suggestion) => (
    <div>{suggestion.dropdown}</div> // Display the 'dropdown' field
  );

    // Define how each suggestion should be displayed (show the 'name')
    const renderDestinationSuggestion = (suggestion) => (
      <div>{suggestion.name}</div> // Display the 'name' field
    );

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-light rounded">
      {/* Autosuggest for Origins */}
      <div className="mb-3">
              <label htmlFor="origins" className="form-label">Origins:</label>
              <Autosuggest
                suggestions={originSuggestions}
                onSuggestionsFetchRequested={handleOriginSuggestionsFetchRequested}
                onSuggestionsClearRequested={handleOriginSuggestionsClearRequested}
                getSuggestionValue={(suggestion) => suggestion.iata} // Use 'iata' for sending in the API call
                renderSuggestion={renderSuggestion} // Use the updated renderSuggestion
                inputProps={{
                  placeholder: 'Type an origin',
                  value: originInput,
                  onChange: handleOriginInputChange,
                }}
                onSuggestionSelected={handleAddOrigin}
              />
        <div className="mt-2">
          {/* Display selected origin iata codes */}
          {originIatas.map((origin, index) => (
            <span key={index} className="badge bg-primary me-2">
              {origin} {/* Showing iata */}
            </span>
          ))}
        </div>
      </div>

      {/* Autosuggest for Destinations */}
      <div className="mb-3">
        <label htmlFor="destinations" className="form-label">Destinations:</label>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
          onSuggestionsClearRequested={handleSuggestionsClearRequested}
          getSuggestionValue={(suggestion) => suggestion.name} // Should be 'name' to match the API response
          renderSuggestion={renderDestinationSuggestion}
          inputProps={{
            placeholder: 'Type a destination',
            value: destinationInput,
            onChange: handleDestinationChange,
          }}
          onSuggestionSelected={handleAddDestination}
        />
        <div className="mt-2">
          {/* Display selected destination codes */}
          {destinations.map((dest, index) => (
            <span key={index} className="badge bg-primary me-2">
              {dest} {/* Showing code */}
            </span>
          ))}
        </div>
      </div>

      {/* Date inputs */}
      <div className="mb-3">
        <label htmlFor="departureDate" className="form-label">Date From:</label>
        <input
          type="date"
          id="departureDate"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="returnDate" className="form-label">Date To:</label>
        <input
          type="date"
          id="returnDate"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="form-control"
        />
      </div>

      {/* Toggle button */}
      <div className="mb-3 form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          id="returnFlightToggle"
          checked={isReturnFlight}
          onChange={(e) => setIsReturnFlight(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="returnFlightToggle">
          Return Flight
        </label>
      </div>

      {/* Conditionally render Date To and Nights inputs */}
      {isReturnFlight && (
        <>
          <div className="mb-3">
            <label htmlFor="nights" className="form-label">
              Nights:
            </label>
            <input
              type="number"
              id="nights"
              value={nights}
              onChange={(e) => setNights(parseInt(e.target.value, 10) || 0)} // Ensure integer value
              className="form-control"
            />
          </div>
        </>
      )}

      <button type="submit" className="btn btn-primary">Search Flights</button>
    </form>
  );
}

export default SearchForm;
