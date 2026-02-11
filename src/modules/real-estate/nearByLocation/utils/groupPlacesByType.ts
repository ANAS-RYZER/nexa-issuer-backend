import { LocationType } from '../../schema/nearByLocation.model';

export interface Place {
  assetId: string;
  name: string;
  address: string;
  distanceInKm: number;
  locationType: LocationType;
  isActive: boolean;
  latitude: string;
  longitude: string;
}

/**
 * Groups places by their location type.
 * @param {Place[]} places - Array of places to group.
 * @returns {Record<string, Place[]>} Places grouped by location type.
 */
export function groupPlacesByType(places: Place[]): Record<string, Place[]> {
  return places.reduce((acc, place) => {
    const type = place.locationType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(place);
    return acc;
  }, {} as Record<string, Place[]>);
}

