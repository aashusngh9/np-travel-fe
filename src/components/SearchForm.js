import React, { useState, useEffect, useCallback } from "react";
import Autosuggest from "react-autosuggest";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfWeek, differenceInHours } from 'date-fns';
import "./SearchForm.css"; // Import the CSS file for styling

import moment from "moment"; // Import moment for date manipulation

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_URL = `${API_BASE_URL}/countries/autosuggest`;
const ORIGINS_API_URL = `${API_BASE_URL}/airports/autosuggest`;
// Example API endpoint (replace with your actual endpoint)
//const API_URL = 'https://ec2-13-51-234-10.eu-north-1.compute.amazonaws.com/countries/autosuggest';
//const ORIGINS_API_URL = 'https://ec2-13-51-234-10.eu-north-1.compute.amazonaws.com/airports/autosuggest';

function SearchForm({ onSearch }) {
  const [origins, setOrigins] = useState("");
  const [destinations, setDestinations] = useState([]);
  const [destinationInput, setDestinationInput] = useState("");
  const [dateFrom, setDateFrom] = useState(new Date()); // Set default to current date
  const [dateTo, setDateTo] =useState(new Date());
  const [suggestions, setSuggestions] = useState([]);
  const [originIatas, setOriginIatas] = useState([]);
  const [originInput, setOriginInput] = useState("");
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [isReturnFlight, setIsReturnFlight] = useState(false);
  const [nights, setNights] = useState(0);

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

  // Fetch origin suggestions from API (using useCallback and debounce)
  const fetchOriginSuggestions = useCallback(
    debounce(async (query) => {
      try {
        const response = await fetch(`${ORIGINS_API_URL}?airport_name=${query}`);
        if (!response.ok) {
          throw new Error("Failed to fetch origin suggestions");
        }
        const data = await response.json();
        setOriginSuggestions(data);
      } catch (error) {
        console.error("Error fetching origin suggestions:", error);
      }
    }, 300), // Debounce with a 300ms delay
    []
  );

  // Function to remove an origin
  const handleRemoveOrigin = (iata) => {
    setOriginIatas(originIatas.filter((origin) => origin !== iata));
  };

  // Function to remove a destination
  const handleRemoveDestination = (destination) => {
    setDestinations(destinations.filter((dest) => dest !== destination));
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

  // Fetch suggestions from API (using useCallback and debounce)
  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      try {
        const response = await fetch(`${API_URL}?country_name=${query}`);
        if (!response.ok) {
          throw new Error("Failed to fetch suggestions");
        }
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    }, 300), // Debounce with a 300ms delay
    []
  );

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

    const formattedDateFrom = moment(dateFrom).format("YYYY-MM-DD");
    const formattedDateTo = moment(dateTo).format("YYYY-MM-DD");

    onSearch({
      origins: originIatas,
      destinations,
      dateFrom: formattedDateFrom, // Send formatted date
      dateTo: formattedDateTo, // Send formatted date
      nights: isReturnFlight ? nights : 0,
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
           <label htmlFor="origins" className="form-label">
             Origins:
           </label>
           <Autosuggest
             suggestions={originSuggestions}
             onSuggestionsFetchRequested={handleOriginSuggestionsFetchRequested}
             onSuggestionsClearRequested={handleOriginSuggestionsClearRequested}
             getSuggestionValue={(suggestion) => suggestion.iata}
             renderSuggestion={renderSuggestion}
             inputProps={{
               placeholder: "Type an origin",
               value: originInput,
               onChange: handleOriginInputChange,
             }}
             onSuggestionSelected={handleAddOrigin}
           />
           {/* Display selected origins with remove option */}
           <div className="selected-origins">
             {originIatas.map((origin) => (
               <span key={origin} className="origin-tag">
                 {origin}{" "}
                 <button
                   type="button"
                   className="btn-close btn-close-small"
                   onClick={() => handleRemoveOrigin(origin)}
                 ></button>
               </span>
             ))}
           </div>
         </div>


{/* Autosuggest for Destinations */}
      <div className="mb-3">
        <label htmlFor="destinations" className="form-label">
          Destinations:
        </label>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
          onSuggestionsClearRequested={handleSuggestionsClearRequested}  

          getSuggestionValue={(suggestion) => suggestion.name}
          renderSuggestion={renderDestinationSuggestion}  

          inputProps={{
            placeholder: "Type a destination",
            value: destinationInput,
            onChange: handleDestinationChange,
          }}
          onSuggestionSelected={handleAddDestination}
        />
        {/* Display selected destinations with remove option */}
        <div className="selected-destinations">
          {destinations.map((destination) => (
            <span key={destination} className="destination-tag">
              {destination}{" "}
              <button
                type="button"
                className="btn-close btn-close-small"
                onClick={() => handleRemoveDestination(destination)}
              ></button>
            </span>
          ))}
        </div>
      </div>
      {/* Date Picker for Date From */}
      <div className="mb-3">
        <label htmlFor="departureDate" className="form-label">
          Date From:
        </label>
        <DatePicker
          id="departureDate"
          selected={dateFrom}
          onChange={(date) => setDateFrom(date)}
          className="form-control"
          dateFormat="yyyy-MM-dd" // Set the desired date format
          minDate={new Date()} // Set the minimum selectable date to today
        />
      </div>
      {/* Date Picker for Date To */}
      <div className="mb-3">
        <label htmlFor="returnDate" className="form-label">
          Date To:
        </label>
        <DatePicker
          id="returnDate"
          selected={dateTo}
          onChange={(date) => setDateTo(date)}
          className="form-control"
          dateFormat="yyyy-MM-dd" // Set the desired date format
          minDate={dateFrom} // Set the minimum selectable date to dateFrom
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
