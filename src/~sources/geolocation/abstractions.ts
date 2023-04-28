export interface ExtendedGeolocationPosition extends GeolocationPosition {
  isUserEnabled: boolean
  error: GeolocationPositionError
}
