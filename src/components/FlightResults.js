import React from 'react';

function FlightResults({ results }) {
  return (
    <div className="p-4 bg-white rounded">
      {results.length === 0 ? (
        <p className="text-muted">No flights found.</p>
      ) : (
        <ul className="list-group">
          {results.map((result) => (
            <li
              key={result.id}
              className="list-group-item mb-2"
            >
              <div>
                <h5 className="mb-1">{result.airline}</h5>
                <p className="mb-1">Price: {result.price}</p>
                <p className="mb-1">Date: {result.date}</p>
                <p className="mb-1">Departure Time: {result.departure_time}</p>
                <p className="mb-1">Arrival Time: {result.arrival_time}</p>
                <p className="mb-1">Route: {result.route}</p>
                <p className="mb-1">Stops: {result.stops}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FlightResults;
