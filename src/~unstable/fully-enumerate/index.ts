export function fullyEnumerate<Enum>(enumObj: Enum): void {
  const allKeys = Object.keys(enumObj)
  for (const key of allKeys) {
    enumObj[enumObj[key]] = key
  }
}
