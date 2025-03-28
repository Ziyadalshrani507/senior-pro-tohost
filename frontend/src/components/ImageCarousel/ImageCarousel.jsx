import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './ImageCarousel.css';

const ImageCarousel = ({ images, altPrefix = 'Image' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="carousel-container">
        <div className="no-images">No images available</div>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="carousel-container">
      <div className="carousel-content">
        <img
          src={images[currentIndex]}
          alt={`${altPrefix} ${currentIndex + 1}`}
          className="carousel-image"
        />
        
        <button 
          className="carousel-button prev"
          onClick={goToPrevious}
          aria-label="Previous image"
        >
          <FaChevronLeft />
        </button>
        
        <button 
          className="carousel-button next"
          onClick={goToNext}
          aria-label="Next image"
        >
          <FaChevronRight />
        </button>

        <div className="carousel-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
      
      <div className="carousel-thumbnails">
        {images.map((image, index) => (
          <button
            key={index}
            className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          >
            <img
              src={image}
              alt={`${altPrefix} thumbnail ${index + 1}`}
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
