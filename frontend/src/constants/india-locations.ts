/**
 * India state and city data via country-state-city.
 * Use for location dropdowns (e.g. doctor discovery).
 */
import { State, City } from "country-state-city";

export const INDIA_COUNTRY_CODE = "IN" as const;

/** All states/UTs for India (from library). */
export function getStates() {
  return State.getStatesOfCountry(INDIA_COUNTRY_CODE);
}

/** Cities for a given state (stateCode = state.isoCode from getStates()). */
export function getCities(stateCode: string) {
  if (!stateCode) return [];
  return City.getCitiesOfState(INDIA_COUNTRY_CODE, stateCode);
}
