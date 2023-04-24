# Internal Errors

## Client Errors

Errors prefixes and meanings: 
* `X` - Literally "impossible error"; theoretically not supposed to happen either because the values are calculated (non-user input) or TypeScript should've thrown a compile error had there been one.
* `Z` - Errors that should also be technically impossble, but the detailed outcome/behaviour is too complicated to predict. Yet, when a certain condition is hit, we know for sure that something has gone wrong.

### `X1`
* Format: `X1-0,1,2`
* Description: Since cabinet count is `{0}`, expected xtimeStack.length to be `{1}` but got `{2}` instead.

## API Errors

### `Z1`
* Format `Z1` (no parameters)
* Description: Errors from Google Cloud Functions are returned as error strings with status `200` for easy parsing. For set-friend-code, the only possible errors (string values) are `INVALID_FRIEND_CODE` or `INVALID_API_KEY`, but a different value eas received.
