# mai Queue

A fan-made online queuing system for the maimai arcade rhythm game.

<br/>

Project Links:
* **Production**: https://mai-queue.vercel.app
* **Preview**: https://mai-queue-git-prerelease-glyph-cat.vercel.app

<br/><hr/><br/>

## Feature List

### ✅ View Queue in Real-time
* All players can view the current queue in real-time
* All players can view up to the past 20 tickets that have been closed in real-time

### ✅ Take Ticket
* Players can take tickets if they are within range of the arcade.

### ✅ Set Friend Code
* Players can set friend code for their tickets, this will be used to show player data on the tickets.
* Normally, the friend code is set after taking a ticket. Then, it persisted in the browser. Player data will automatically be derived from the player code for subsequent requests to take new tickets.
* Submit empty string (`''`) to remove friend code.

### ✅ Close Ticket
* Players can close tickets (either prematurely or when it's their turn).

### ✅ Swap Tickets
* Players can swap tickets with each other.
* The same request can be sent up to 3 times in case of decline.
* Any incoming or outgoing requests will be represented in a pop-up, this pop-up will persist even after a page refresh so that players don't miss it.

### ✅ Transfer Ticket
* A player can transfer ticket to another player with no ticket yet.
* This is done by the player with a ticket scanning the QR code on the phone of the player without a ticket yet.

### ✅ Take Ticket For Another Player
* As a backup measure, if a player's phone have no GPS access for some reason, another player can take the ticket for them.
* This is done by the player whose phone without GPS access showing a QR code for another player to scan.

### ✅ Clear Cache
* In case of any anomaly, a player can choose to clear the cache on the device.
* If the player has an active ticket, the system will attempt to close it.
* The device key will be revoked and the page will be refreshed.
* If the active ticket cannot be closed due to said anomaly, the player will no longer have access to the ticket either.

### 🚧 Automatically Delete Old Data
* Work inprogress.
* Data to be deleted includes:
  * Tickets and 
  * Swap Requests
  * Screenshots of player banners

### 🚧 Receive Notifications (Phase 2)
* Players can opt in to receive notifications when:
  * it's their turn next
  * another player requests for a ticket swap

### 🚧 Reporting Incidents (Phase 2)
* Players can report incidents happening at an arcade such as:
  * Arcade not open during supposed operating hours
  * Cabinets cannot connect to server for some reason
  * Power outage
  * Flood
  * Miscellaneous

### 🚧 Set Player Name (still considering)
* Allow players to at least set their player name if they don't have access to their maimai account or don't have a card.

<br/><hr/><br/>

## System Requirements
* Location service (GPS) is required to make sure players take tickets only when they within the area of the arcade.
* iOS/iPadOS 16.4 or above is required for push notifications to work on Apple devices.
* Camera access might be required to scan QR codes.

<br/><hr/><br/>

## Risks & System Limitations

### • Adoptation of System
The success of this system completely depends on whether players are willing to adopt and cooperate.

### • Trust Between Players Is Still Required
It is possible for one single player to take multiple tickets by using multiple devices or using incognito browsing. As such, this still requires players to look out for each other.

### • Not All Players Have Card
While the system encourages the use of friend code, not all players have Banapass or Aime card, and some who do might have forgotten their account password, making their friend code unretrievable.

### • System Down
All digital systems carry some risk of not functioning at some point due to too much traffic or bugs or cyberattacks. This system is not an exception either.

<br/>
