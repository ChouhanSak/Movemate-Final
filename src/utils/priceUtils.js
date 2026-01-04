// src/utils/priceUtils.js

/**
 * Calculate total price for a booking
 * @param {number} distance - Total distance in km
 * @param {number} perKmRate - Rate per km from Firestore
 * @param {number} additionalCharges - Any additional charges entered by agency
 * @returns {number} total price
 */
export function calculatePrice(distance, perKmRate, additionalCharges = 0) {
  if (!distance || !perKmRate) return 0;
  return distance * perKmRate + (additionalCharges || 0);
}
