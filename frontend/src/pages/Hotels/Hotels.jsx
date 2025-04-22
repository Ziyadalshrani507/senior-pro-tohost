import React, { useState } from 'react';
import './Hotels.css';

const Hotels = () => {
  // Hardcoded list of hotels
  const hotels = [
    {
      id: 1,
      name: 'Riyadh Grand Hotel',
      description: 'A luxurious hotel in the heart of Riyadh.',
      pricePerNight: 500,
      rating: 4.5,
      imageUrl: 'https://via.placeholder.com/300x200',
      activities: ['Spa', 'Swimming Pool', 'Gym', 'Fine Dining'],
    },
    {
      id: 2,
      name: 'Jeddah Beach Resort',
      description: 'A beautiful beachfront hotel in Jeddah.',
      pricePerNight: 400,
      rating: 4.2,
      imageUrl: 'https://via.placeholder.com/300x200',
      activities: ['Beach Access', 'Water Sports', 'Barbecue'],
    },
    {
      id: 3,
      name: 'Mecca Royal Hotel',
      description: 'A premium hotel near the holy mosque in Mecca.',
      pricePerNight: 600,
      rating: 4.8,
      imageUrl: 'https://via.placeholder.com/300x200',
      activities: ['Prayer Rooms', 'Shopping Mall', 'Restaurants'],
    },
  ];

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  const handleBooking = () => {
    if (!checkInDate || !checkOutDate) {
      alert('Please select check-in and check-out dates.');
      return;
    }
    alert(`Booking confirmed for ${selectedHotel.name} from ${checkInDate} to ${checkOutDate}`);
  };

  return (
    <div className="hotels-page">
      {selectedHotel ? (
        <div className="hotel-details-container">
          <button className="back-button" onClick={() => setSelectedHotel(null)}>
            Back to Hotels
          </button>
          <div className="hotel-details">
            <img src={selectedHotel.imageUrl} alt={selectedHotel.name} className="hotel-image" />
            <h1>{selectedHotel.name}</h1>
            <p>{selectedHotel.description}</p>
            <p>Price per night: {selectedHotel.pricePerNight} SAR</p>
            <p>Rating: {selectedHotel.rating} ⭐</p>
            <h3>Activities:</h3>
            <ul>
              {selectedHotel.activities.map((activity, index) => (
                <li key={index}>{activity}</li>
              ))}
            </ul>
            <div className="date-picker">
              <label>
                Check-in Date:
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                />
              </label>
              <label>
                Check-out Date:
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                />
              </label>
            </div>
            <button className="book-button" onClick={handleBooking}>
              Book Now
            </button>
          </div>
        </div>
      ) : (
        <>
          <h1>Hotels</h1>
          <div className="hotels-grid">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="hotel-card"
                onClick={() => setSelectedHotel(hotel)}
              >
                <img src={hotel.imageUrl} alt={hotel.name} />
                <h2>{hotel.name}</h2>
                <p>{hotel.description}</p>
                <p>Price per night: {hotel.pricePerNight} SAR</p>
                <p>Rating: {hotel.rating} ⭐</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Hotels;