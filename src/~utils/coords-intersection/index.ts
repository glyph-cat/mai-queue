import { ICoordinate } from '~abstractions'

export function checkIfCoordIsWithinRadius(
  evaluationCoord: ICoordinate,
  targetCoord: ICoordinate,
  radius: number
): boolean {
  return getLatLonDistance(evaluationCoord, targetCoord) <= radius
}

/**
 * Reference: https://www.movable-type.co.uk/scripts/latlong.html
 */
function getLatLonDistance(coord1: ICoordinate, coord2: ICoordinate): number {

  const { latitude: lat1, longitude: lon1 } = coord1
  const { latitude: lat2, longitude: lon2 } = coord2

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
