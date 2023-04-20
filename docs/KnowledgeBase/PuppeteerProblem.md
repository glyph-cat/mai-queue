# Puppeteer cannot run in Vercel serverless functions because time and memory limit

https://www.youtube.com/watch?v=X6VIWHl3JmM
https://github.com/orgs/vercel/discussions/124#discussioncomment-569978
https://github.com/vercel/vercel/issues/4739#issuecomment-658797724
https://nextjs-scraper-playground.vercel.app
https://github.com/vercel/virtual-event-starter-kit/blob/main/lib/screenshot.ts

NOTE: For this project, eventually the solution was to host the one function that
requires Puppeteer using Google Cloud Functions.
