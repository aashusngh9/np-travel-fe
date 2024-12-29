import React, { useState, useEffect } from 'react';
import SearchForm from './components/SearchForm';
import FlightResults from './components/FlightResults';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function App() {
  const [flightData, setFlightData] = useState([]);

  const handleSearch = async (searchParams) => {
    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),  
        // Send the updated searchParams object
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const   
 data = await response.json();
      setFlightData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error fetching data:', error);
      // Consider displaying an error message to the user
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Airfare App</h1>
      <SearchForm onSearch={handleSearch} />
      <FlightResults results={flightData} />
    </div>
  );
}

export default App;
