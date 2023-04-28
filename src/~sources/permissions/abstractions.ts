export enum PermissionType {
  GEOLOCATION = 1,
  NOTIFICATION,
}

export enum PermissionStatus {
  PROMPT = 1,
  GRANTED,
  DENIED,
  UNSUPPORTED,
}

export type PermissionCollection = Record<PermissionType, PermissionStatus>
