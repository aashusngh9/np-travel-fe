import React, { useState } from "react";

function FlightResults({ results }) {
  const [expandedItems, setExpandedItems] = useState({});

  const handleCardToggle = (itemId) => {
    setExpandedItems((prevState) => ({
      ...prevState,
      [itemId]: !prevState[itemId],
    }));
  };

  return (
    <div className="p-4 bg-white rounded">
      {results.length === 0 ? (
        <p className="text-muted">No flights found.</p>
      ) : (
        <ul className="list-group">
          {results.map((result) => (
            <li key={result.id} className="list-group-item mb-2">
              <div>
                <div
                  onClick={() => handleCardToggle(result.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1">
                        {Array.isArray(result.airline)
                          ? result.airline.join(", ")
                          : result.airline}
                      </h5>
                      <p className="mb-1">
                        <span className="fw-bold">
                          {result.origin_city}
                        </span>{" "}
                        to <span className="fw-bold">{result.destination_city}</span> -{" "}
                        {result.destination_country}
                      </p>
                    </div>
                    <div className="text-end">
                      <h6 className="mb-0 fw-bold text-primary">
                        Rs. {result.price}
                      </h6>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-1">
                        {result.date} | {result.departure_time} -{" "}
                        {result.arrival_time}
                      </p>
                      <p className="mb-0 text-muted">
                        {result.stops === 0
                          ? "Non-stop"
                          : `${result.stops} stops`}
                      </p>
                    </div>
                  </div>
                </div>
                 {result.link && (
                        <a href={result.link} target="_blank" rel="noopener noreferrer" className="btn btn-link mt-2">
                          Book Now
                        </a>
                      )}
                {expandedItems[result.id] && (
                  <div className="mt-3">
                    <ul className="list-group list-group-flush">
                      {result.routes.map((route) => (
                        <li
                          key={route.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <b>{route.cityFrom}</b>
                            {"->"}
                            <b>{route.cityTo}</b> - {route.airline}
                          </div>
                          <div className="text-muted">
                            ( {route.local_departure}, {route.local_arrival})
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FlightResults;