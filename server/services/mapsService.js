const axios = require('axios');

/**
 * Calculate Euclidean distance between two coordinate points (fallback).
 */
const euclideanDistance = (lat1, lng1, lat2, lng2) => {
  return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
};

/**
 * Get distance between two coordinate points.
 * Uses Google Maps Distance Matrix API if API key is configured,
 * otherwise falls back to Euclidean distance calculation.
 * 
 * @param {Object} origin - { latitude, longitude }
 * @param {Object} destination - { latitude, longitude }
 * @returns {Promise<number>} Distance value
 */
const getDistance = async (origin, destination) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn('⚠️  Google Maps API key not configured. Using Euclidean distance fallback.');
    return euclideanDistance(
      origin.latitude, origin.longitude,
      destination.latitude, destination.longitude
    );
  }

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins: `${origin.latitude},${origin.longitude}`,
        destinations: `${destination.latitude},${destination.longitude}`,
        key: apiKey
      }
    });

    if (
      response.data.status === 'OK' &&
      response.data.rows[0]?.elements[0]?.status === 'OK'
    ) {
      return response.data.rows[0].elements[0].distance.value; // meters
    }

    console.warn('Google Maps API returned non-OK status. Falling back to Euclidean distance.');
    return euclideanDistance(
      origin.latitude, origin.longitude,
      destination.latitude, destination.longitude
    );
  } catch (error) {
    console.warn(`⚠️  Google Maps API error: ${error.message}. Using Euclidean distance fallback.`);
    return euclideanDistance(
      origin.latitude, origin.longitude,
      destination.latitude, destination.longitude
    );
  }
};

/**
 * Geocode an address to coordinates using Google Maps.
 * Falls back to null if API key is not set.
 * 
 * @param {string} address - Address string to geocode
 * @returns {Promise<Object|null>} { latitude, longitude } or null
 */
const geocodeAddress = async (address) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn('⚠️  Google Maps API key not configured. Cannot geocode address.');
    return null;
  }

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: apiKey
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng
      };
    }

    return null;
  } catch (error) {
    console.warn(`⚠️  Geocoding error: ${error.message}`);
    return null;
  }
};

module.exports = { getDistance, geocodeAddress, euclideanDistance };
