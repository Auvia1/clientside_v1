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

/**
 * Format a Date object to local YYYY-MM-DD string
 * @param {Date} date - The date to format
 * @returns {string} Formatted local date string
 */
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date object as Weekday, DD Month YYYY (e.g. Saturday, 27 June 2026)
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatLocalDateLong(date = new Date()) {
  return date.toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

/**
 * Format a Date object time as hh:mm am/pm (e.g. 05:07 am)
 * @param {Date} date - The date to format
 * @returns {string} Formatted time string
 */
export function formatLocalTime(date = new Date()) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });
}
