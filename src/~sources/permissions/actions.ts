import { PermissionStatus, PermissionType } from './abstractions'
import { PermissionsSource } from './source'

export async function setPermissionStatus(
  type: PermissionType,
  status: PermissionStatus
): Promise<void> {
  await PermissionsSource.set(s => ({ ...s, [type]: status }))
}

export async function getPermissionStatus(type: PermissionType): Promise<PermissionStatus> {
  return (await PermissionsSource.getAsync())[type]
}
