# Indexes

## Current Queue
Used in:
* ✅ Client
* ❌ Server

|   Field    | Alias for  | Order     |
| :--------: | :--------: | --------- |
|    `a`     | `arcadeId` | Ascending |
|    `x`     |  `xTime`   | Ascending |
|    `c`     |  `ctime`   | Ascending |
| `__name__` |            | Ascending |

## Past Queue
Used in:
* ✅ Client
* ❌ Server

|   Field    | Alias for  | Order      |
| :--------: | :--------: | ---------- |
|    `a`     | `arcadeId` | Ascending  |
|    `x`     |  `xTime`   | Descending |
| `__name__` |            | Descending |

## Last Played
Used in:
* ✅ Client
* ❌ Server

|   Field    | Alias for  | Order      |
| :--------: | :--------: | ---------- |
|    `a`     | `arcadeId` | Ascending  |
|    `y`     | `xReason`  | Ascending  |
|    `x`     |  `xTime`   | Descending |
| `__name__` |            | Descending |

## Listening for Incoming Swap Requests
Used in:
* ✅ Client
* ❌ Server

|   Field    |      Alias for      | Order     |
| :--------: | :-----------------: | --------- |
|    `a`     |     `arcadeId`      | Ascending |
|    `tt`    |  `targetTicketId`   | Ascending |
|    `ws`    | `swapRequestStatus` | Ascending |
|    `e`     |   `declineCount`    | Ascending |
| `__name__` |                     | Ascending |

## Querying for Last Ticket
Used to determine last issued ticket number when generating new tickets.

Used in:
* ❌ Client
* ✅ Server

|   Field    |   Alias for    | Order      |
| :--------: | :------------: | ---------- |
|    `a`     |   `arcadeId`   | Ascending  |
|    `tn`    | `ticketNumber` | Descending |
| `__name__` |                | Descending |

# Limit
* There are a few queries throughout the project that require indexing
* For each query, there will be 3 sets of indexes
* For example, for each collection, example: `Tickets`, three collections `PROD_Tickets`, `PREVIEW_Tickets`, `INTERNAL_Tickets` will be created.
* This is so that the data from production, preview, and internal(localhost) environments don't cross-pollute.
* But there is a limit to how many indexes that can be created for a single database.
* Reference: https://cloud.google.com/firestore/quotas#indexes
