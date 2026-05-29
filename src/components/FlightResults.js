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
    <div className="p-4 bg-light">
      {results.length === 0 ? (
        <p className="text-muted">No flights found.</p>
      ) : (
        <div className="row">
          {results.map((result) => {
            // Calculate layovers
            const onwardLayovers = result.routes.filter((route) => route.isReturn === 0).length - 1;
            const returnLayovers = result.routes.filter((route) => route.isReturn === 1).length - 1;

            return (
              <div key={result.id} className="col-12 mb-4">
                <div className="card shadow-sm">
                  <div
                    className="card-header text-white"
                    style={{
                      backgroundColor: "#394867", // Dark slate blue
                      cursor: "pointer",
                    }}
                    onClick={() => handleCardToggle(result.id)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-1">
                          {Array.isArray(result.airline)
                            ? result.airline.join(", ")
                            : result.airline}
                        </h5>
                        <p className="mb-0">
                          {result.origin_city} → {result.destination_city} -{" "}
                          {result.destination_country}
                        </p>
                      </div>
                      <h6 className="mb-0 fw-bold">₹ {result.price}</h6>
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="mb-1">
                      {result.date} | {result.departure_time} → {result.arrival_time}
                    </p>
                    <p className="mb-3 text-muted">
                      {onwardLayovers + returnLayovers === 0
                        ? "Non-stop"
                        : `${onwardLayovers > 0 ? `Onward layover(s): ${onwardLayovers}` : ""}${
                            onwardLayovers > 0 && returnLayovers > 0 ? " and " : ""
                          }${
                            returnLayovers > 0 ? `Return layover(s): ${returnLayovers}` : ""
                          }`}
                    </p>
                    {result.link && (
                      <a
                        href={result.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn"
                        style={{
                          backgroundColor: "#4e5d94", // Slightly lighter blue
                          color: "white",
                        }}
                      >
                        Book Now
                      </a>
                    )}
                    {expandedItems[result.id] && (
                      <div>
                        <h6
                          className="mt-3"
                          style={{
                            color: "#5DA2D5", // Teal-like color for Onward Flights
                          }}
                        >
                          <span role="img" aria-label="Onward Flights">
                            🛫
                          </span>{" "}
                          Onward Flights
                        </h6>
                        <ul className="list-group list-group-flush mb-3">
                          {result.routes
                            .filter((route) => route.isReturn === 0)
                            .map((route) => (
                              <li
                                key={route.id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                              >
                                <div>
                                  {route.cityFrom} → {route.cityTo} - {route.airline}
                                </div>
                                <div className="text-muted">
                                  ({route.local_departure_date} | {route.local_departure} →{" "}
                                  {route.local_arrival})
                                </div>
                              </li>
                            ))}
                        </ul>

                        {result.routes.some((route) => route.isReturn === 1) && (
                          <>
                            <h6
                              className="mt-3"
                              style={{
                                color: "#F2A65A", // Amber-like color for Return Flights
                              }}
                            >
                              <span role="img" aria-label="Return Flights">
                                🛬
                              </span>{" "}
                              Return Flights
                            </h6>
                            <ul className="list-group list-group-flush">
                              {result.routes
                                .filter((route) => route.isReturn === 1)
                                .map((route) => (
                                  <li
                                    key={route.id}
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                  >
                                    <div>
                                      {route.cityFrom} → {route.cityTo} - {route.airline}
                                    </div>
                                    <div className="text-muted">
                                      ({route.local_departure_date} | {route.local_departure} →{" "}
                                      {route.local_arrival})
                                    </div>
                                  </li>
                                ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FlightResults;
