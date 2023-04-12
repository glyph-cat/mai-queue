import { Coord } from '~abstractions'

export function checkIfCoordIsWithinRadius(
  evaluationCoord: Coord,
  targetCoord: Coord,
  radius: number
): boolean {
  // TODO: [High priority] Take altitude into consideration, but when it is available
  // if (evaluationCoord.altitude ... ) { }
  return getLatLonDistance(evaluationCoord, targetCoord) <= radius
}

/**
 * Reference: https://www.movable-type.co.uk/scripts/latlong.html
 */
function getLatLonDistance(coord1: Coord, coord2: Coord): number {

  const { latitude: lat1, longitude: lon1, altitude: alt1 } = coord1
  const { latitude: lat2, longitude: lon2, altitude: alt2 } = coord2

  const R = 6371e3 // metres
  const φ1 = lat1 * Math.PI / 180 // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // in metres
}

/**
 * @see https://dirask.com/posts/JavaScript-calculate-distance-between-two-points-in-3D-space-xpz9aD
 */
function UNSTABLE_getDistance(coord1: Coord, coord2: Coord): number {
  const dLat = coord2.latitude - coord1.latitude
  const dLon = coord2.longitude - coord1.longitude
  const dAlt = coord2.altitude - coord1.altitude
  return Math.sqrt(Math.pow(dLat, 2) + Math.pow(dLon, 2) + Math.pow(dAlt, 2))
}
