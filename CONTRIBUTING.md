# Install dependencies
Run `yarn install`

<br/>

# Prepare local environment variables

1. Create a file named `env.local` in the project root directory.
2. Populate the files with the contents shown below.
3. Sensitive information have been redacted, you will have to fill in your own credentials for this project to be able to run.

```diff
- IMPORTANT: NEVER INCLUDE ANY OF YOUR CREDENTIALS / SENSITIVE INFORMATION IN GIT COMMITS. IF PUSHED TO A REPO BY ACCIDENT, IMMEDIATELY CHANGE PASSWORDS OF THE EXPOSED ACCOUNTS, GENERATE NEW API KEYS AND ABANDON THE OLD ONES.
```

```sh
# App variables
NEXT_PUBLIC_APP_SALT=████████    # Generate your own values
NEXT_PUBLIC_APP_API_KEY=████████ # Generate your own values

# Special (Backend only)
SEGA_ID=████████ # Create your own SEGA account
SEGA_PW=████████ # Create your own SEGA account

# Firebase (Exposed to client)
# You will need to retrieve these in the Firebase console
# Project Overview > (under the project title) > Click "Add app"
NEXT_PUBLIC_FIREBASE_PROJECT_ID=PROJECT_NAME
NEXT_PUBLIC_FIREBASE_CLIENT_API_KEY=████████
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=PROJECT_NAME.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=PROJECT_NAME.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=████████
NEXT_PUBLIC_FIREBASE_APP_ID=████████

# Firebase (Backend only)
# You will need to generate these in the Firebase console
# Gear button beside "Project Overview" > Project settings > Service accounts > Firebase Admin SDK (sidebar) > Generate new private key
FIREBASE_CLIENT_EMAIL=████████
FIREBASE_PRIVATE_KEY='["-----BEGIN PRIVATE KEY-----\n████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████\n-----END PRIVATE KEY-----\n"]'
```

4. Create a file based on the path `functions/src/bridge.secrets.ts` and populate with the data below

```ts
/**
 * Different API keys are used for development and production
 */
export const APP_API_KEY: Array<string> = [
  '████████',
  '████████',
]

export const SEGA_ID = '████████'

export const SEGA_PW = '████████'

export const FIREBASE_STORAGE_BUCKET = 'PROJECT_NAME.appspot.com'
```

5. Create `vercel.json` in the root of the project directory:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-reset?api_key=<API_KEY>",
      "schedule": "0 0 * * *"
    }
  ]
}
```

...and replace `<API_KEY>` with the same API key from above. Note that this should be the production API key.

<br/>

Quote:
> There is currently no built-in way to secure cron jobs...

Source: https://vercel.com/docs/cron-jobs#how-to-secure-cron-jobs

<br/>

# Running in localhost
1. Run `yarn start` to start the UI.
2. Run `yarn fn` to start Firebase functions emulator.
3. Visit [`http://localhost:3000`](http://localhost:3000).

# Enabling HTTPS
The Notification Web API according to [MDN](https://developer.mozilla.org/en-US/docs/Web/API/notification):
> This feature is available only in [secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) (HTTPS), in some or all [supporting browsers](https://developer.mozilla.org/en-US/docs/Web/API/notification#browser_compatibility).

To run the project in HTTPS, follow the steps below:
1. Create a [ngrok](https://ngrok.com) account.
2. Go to the [setup](https://dashboard.ngrok.com/get-started/setup) section
3. In the "2. Connect your account" section, copy the command/token and run it in the Terminal.
```sh
# Example
ngrok config add-authtoken ████████████████
```
4. Run `yarn ngrok` in the project directory.
5. A HTTP and HTTPS tunnel link will be shown to you, open the HTTPS link in a browser.

<br/>

# Creating Pull Requests
After creating a fork of the repo, please switch to and make changes on the `prerelease` branch. Then when creating pull requests, it should be a request to merge from the forked `prerelease` branch to the original `prerelease` branch.

<br/>
