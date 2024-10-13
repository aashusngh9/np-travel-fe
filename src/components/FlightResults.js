import React from "react";

function FlightResults({ results }) {
  return (
    <div className="p-4 bg-white rounded">
      {results.length === 0 ? (
        <p className="text-muted">No flights found.</p>
      ) : (
        <ul className="list-group">
          {results.map((result) => (
            <li key={result.id} className="list-group-item mb-2">
              <div>
                <h5 className="mb-1">
                  {/* Check if result.airline is an array */}
                  {Array.isArray(result.airline) ? (
                    // If it's an array, join the elements with a comma and space
                    result.airline.join(", ")
                  ) : (
                    // Otherwise, display it as is
                    result.airline
                  )}
                </h5>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1">
                      {result.origin_city} to {result.destination_city} -{" "}
                      {result.destination_country}
                    </p>
                    <p className="mb-1">
                      {result.date} | {result.departure_time} -{" "}
                      {result.arrival_time}
                    </p>
                    <p className="mb-0">
                      {result.stops === 0 ? "Non-stop" : `${result.stops} stops`}
                    </p>
                  </div>
                  <div className="text-end">
                    <h6 className="mb-0 fw-bold text-primary">
                      Rs.{result.price}
                    </h6>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FlightResults;