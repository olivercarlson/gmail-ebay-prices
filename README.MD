# An eBay Order Parsing Script for GMail inboxes.

### What?

A tool to automatically parse through gmail inboxes and return all eBay orders from the time frame.

## Features:

-   Connect to gmail API, filter first batch of 100 emails.

### In Progress:

-   [ ] Logic to handle a single e-mail:
    -   [x] Parse and convert message from B64 to utf-8
    -   [x] Strip HTML tags
    -   [ ] Locate all relevant information
    -   [ ] Store information in temp buffer or StringIO
    -   [ ] Save data as CSV
    -   [ ] Grab "View Order Details" Link
-   [ ] Finish skeleton structure for organizing code by adding:
    -   [ ] Add general routes type structure for app.ts to select retailers
    -   [ ] Tentative logic separation: /gmailAuth/, /stores/\* (eBay, BestBuy), config.json/.yaml

### Backlog:

-   Add CLI or fs based configuration for query (e.g date range)
-   Add batch/recursive fetching until all emails within range have been queried.
-   Format and Convert results into csv.
-   Consider creating npm package for ts-readline-async.

### Completed:

-   [x] Convert Google API callback code to async/await.
