import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate percentage of value relative to total
 * @param {number} value - The value to calculate percentage for
 * @param {number} total - The total value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export function calculatePercentage(value, total, decimals = 1) {
	if (!total || total === 0) return "0";
	return ((value / total) * 100).toFixed(decimals);
}

/**
 * Calculate percentage and round to nearest integer
 * @param {number} value - The value to calculate percentage for
 * @param {number} total - The total value
 * @returns {number} Rounded percentage
 */
export function calculatePercentageRounded(value, total) {
	if (!total || total === 0) return 0;
	return Math.round((value / total) * 100);
}

/**
 * Extract API response data with fallback
 * @param {object} response - API response object
 * @param {*} defaultValue - Default value if extraction fails
 * @returns {*} Extracted data or default value
 */
export function extractApiData(response, defaultValue = null) {
	return response?.data ?? response ?? defaultValue;
}

/**
 * Extract array data from API response with fallback
 * @param {object} response - API response object
 * @param {array} defaultValue - Default array if extraction fails (default: [])
 * @returns {array} Extracted array or default value
 */
export function extractArrayData(response, defaultValue = []) {
	const data = extractApiData(response, defaultValue);
	return Array.isArray(data) ? data : defaultValue;
}
