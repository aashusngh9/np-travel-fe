import React, { useState } from 'react';

function SearchForm({ onSearch }) {
  const [origins, setOrigins] = useState('');
  const [destinations, setDestinations] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const originArray = origins.split(',').map(origin => origin.trim());
    const destinationArray = destinations.split(',').map(dest => dest.trim());
    onSearch({
      origins: originArray,
      destinations: destinationArray,
      dateFrom,
      dateTo
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-light rounded">
      <div className="mb-3">
        <label htmlFor="origins" className="form-label">
          Origins (comma-separated):
        </label>
        <input
          type="text"
          id="origins"
          value={origins}
          onChange={(e) => setOrigins(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="destinations" className="form-label">
          Destinations (comma-separated):
        </label>
        <input
          type="text"
          id="destinations"
          value={destinations}
          onChange={(e) => setDestinations(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="departureDate" className="form-label">
          Departure Date:
        </label>
        <input
          type="date"
          id="departureDate"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="returnDate" className="form-label">
          Return Date:
        </label>
        <input
          type="date"
          id="returnDate"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="form-control"
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Search Flights
      </button>
    </form>
  );
}

export default SearchForm;
