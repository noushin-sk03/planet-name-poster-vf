/**
 * calculator.js - Celestial Biophysics & Orbital Calculations
 * -------------------------------------------------------------
 * Pure mathematical functions for calculating weight, age, and diurnal
 * ratios on different solar system bodies.
 *
 * All functions are pure (no DOM access, no external state mutation)
 * making them deterministic, reliable, and easily testable.
 */

const CelestialCalculator = (() => {
  // Standard Earth gravitational acceleration (m/s²)
  const EARTH_GRAVITY = 9.80665;
  // Earth tropical year in days for fractional age precision
  const DAYS_PER_EARTH_YEAR = 365.2425;
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  /**
   * Parses numerical gravity from planets.json string (e.g. "3.7 m/s²" -> 3.7)
   * @param {string|number} gravityVal
   * @returns {number}
   */
  function parseGravity(gravityVal) {
    if (typeof gravityVal === 'number') return gravityVal;
    if (!gravityVal) return EARTH_GRAVITY;
    const match = String(gravityVal).match(/([0-9]+(?:\.[0-9]+)?)/);
    return match ? parseFloat(match[1]) : EARTH_GRAVITY;
  }

  /**
   * Parses length of day in hours from planets.json (e.g. "4,222.6 hours ..." -> 4222.6)
   * @param {string|number} lengthOfDayVal
   * @returns {number}
   */
  function parseLengthOfDayHours(lengthOfDayVal) {
    if (typeof lengthOfDayVal === 'number') return lengthOfDayVal;
    if (!lengthOfDayVal) return 24.0;
    // Strip commas and match first float
    const cleanStr = String(lengthOfDayVal).replace(/,/g, '');
    const match = cleanStr.match(/([0-9]+(?:\.[0-9]+)?)/);
    return match ? parseFloat(match[1]) : 24.0;
  }

  /**
   * Formula 1: Weight on Planet
   * ----------------------------
   * weight_planet = weight_earth * (planet_gravity / earth_gravity)
   *
   * Explanation:
   * Mass remains constant anywhere in the universe. What a scale measures as "weight"
   * is the downward normal force exerted by gravity: F = m * g.
   *
   * @param {number|null} weightKg - User's weight on Earth in kg
   * @param {number|string} planetGravity - Planet's surface gravity in m/s²
   * @returns {Object} { value: number|null, formatted: string, ratio: number }
   */
  function calculateWeightOnPlanet(weightKg, planetGravity) {
    const pGrav = parseGravity(planetGravity);
    const ratio = pGrav / EARTH_GRAVITY;

    if (weightKg === null || weightKg === undefined || isNaN(weightKg) || weightKg <= 0) {
      return {
        value: null,
        formatted: '—',
        ratio: Number(ratio.toFixed(2)),
        message: 'Enter your weight to see gravitational pull'
      };
    }

    const calculatedWeight = weightKg * ratio;
    return {
      value: Number(calculatedWeight.toFixed(1)),
      formatted: `${calculatedWeight.toFixed(1)} kg`,
      ratio: Number(ratio.toFixed(2)),
      message: `${(ratio * 100).toFixed(0)}% of Earth gravity`
    };
  }

  /**
   * Formula 2: Age in Planet Years
   * -------------------------------
   * age_planet = age_in_earth_years / orbital_period_in_earth_years
   *
   * Explanation:
   * A "year" is the time a world takes to complete one orbit around its host star.
   * Worlds farther from the Sun take much longer to orbit (Kepler's 3rd Law),
   * meaning you have lived far fewer planetary years there.
   *
   * @param {string|Date|null} birthDateStr - Date string 'YYYY-MM-DD' or Date object
   * @param {number} orbitalPeriodYears - Planetary orbital period in Earth years
   * @param {Date} [referenceDate=new Date()] - Current date for comparison
   * @returns {Object} { value: number|null, formatted: string, earthAgeYears: number|null, error: string|null }
   */
  function calculateAgeOnPlanet(birthDateStr, orbitalPeriodYears, referenceDate = new Date()) {
    if (!birthDateStr) {
      return {
        value: null,
        formatted: '—',
        earthAgeYears: null,
        error: null,
        message: 'Enter your birth date to see planetary age'
      };
    }

    const birthDate = new Date(birthDateStr);
    if (isNaN(birthDate.getTime())) {
      return {
        value: null,
        formatted: '—',
        earthAgeYears: null,
        error: 'Invalid birth date format',
        message: 'Please enter a valid calendar date'
      };
    }

    // Check for future dates
    const diffMs = referenceDate.getTime() - birthDate.getTime();
    if (diffMs < 0) {
      return {
        value: null,
        formatted: '—',
        earthAgeYears: null,
        error: 'Future date',
        message: 'Birth date cannot be in the future'
      };
    }

    // Fractional Earth years lived
    const earthDaysLived = diffMs / MS_PER_DAY;
    const earthYearsLived = earthDaysLived / DAYS_PER_EARTH_YEAR;

    // Handle edge case: The Sun does not orbit a host star
    if (!orbitalPeriodYears || orbitalPeriodYears <= 0) {
      return {
        value: null,
        formatted: 'N/A',
        earthAgeYears: Number(earthYearsLived.toFixed(1)),
        error: null,
        message: 'The Sun does not orbit a host star (0 orbital period)'
      };
    }

    const planetAge = earthYearsLived / orbitalPeriodYears;

    let formattedStr = '';
    if (planetAge >= 1) {
      formattedStr = `${planetAge.toFixed(1)} yrs`;
    } else {
      // For very long orbits (e.g. Neptune), show 2 decimal places
      formattedStr = `${planetAge.toFixed(2)} yrs`;
    }

    return {
      value: Number(planetAge.toFixed(2)),
      formatted: formattedStr,
      earthAgeYears: Number(earthYearsLived.toFixed(1)),
      error: null,
      message: `${earthYearsLived.toFixed(1)} Earth years lived`
    };
  }

  /**
   * Formula 3: Earth Days vs. Planet Days Ratio
   * --------------------------------------------
   * planet_days_in_1_earth_day = 24.0 / planet_length_of_day_hours
   * earth_days_in_1_planet_day = planet_length_of_day_hours / 24.0
   *
   * Explanation:
   * Compares the rotational period of the planet against a standard 24-hour Earth day.
   *
   * @param {string|number} lengthOfDay - Planet's length of day (hours string or number)
   * @returns {Object} { planetDaysPerEarthDay: number, earthDaysPerPlanetDay: number, formatted: string }
   */
  function calculateDiurnalRatio(lengthOfDay) {
    const planetDayHours = parseLengthOfDayHours(lengthOfDay);
    if (planetDayHours <= 0) {
      return {
        planetDaysPerEarthDay: 0,
        earthDaysPerPlanetDay: 0,
        formatted: '—',
        message: 'Unknown day length'
      };
    }

    // How many of this planet's days pass during a single 24-hour Earth day
    const planetDaysPerEarthDay = 24.0 / planetDayHours;
    // How many Earth days (24h) equal one full rotation on this planet
    const earthDaysPerPlanetDay = planetDayHours / 24.0;

    let formatted = '';
    let message = '';

    if (planetDayHours >= 24) {
      // Day is longer than Earth day (e.g. Venus, Mercury, Moon)
      formatted = `${planetDaysPerEarthDay.toFixed(3)} days`;
      message = `1 planet day = ${earthDaysPerPlanetDay.toFixed(1)} Earth days (${planetDayHours.toFixed(1)} hrs)`;
    } else {
      // Day is shorter than Earth day (e.g. Jupiter 9.9h)
      formatted = `${planetDaysPerEarthDay.toFixed(2)} days`;
      message = `Spins faster than Earth: 1 day is only ${planetDayHours.toFixed(1)} hrs`;
    }

    return {
      planetDaysPerEarthDay: Number(planetDaysPerEarthDay.toFixed(3)),
      earthDaysPerPlanetDay: Number(earthDaysPerPlanetDay.toFixed(2)),
      dayHours: planetDayHours,
      formatted,
      message
    };
  }

  return {
    calculateWeightOnPlanet,
    calculateAgeOnPlanet,
    calculateDiurnalRatio,
    parseGravity,
    parseLengthOfDayHours,
    EARTH_GRAVITY
  };
})();

// Export for Node.js test environments if running under module/commonjs
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CelestialCalculator;
}
