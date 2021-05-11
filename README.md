# Welcome to My Sheet Music!
API used: Open Opus API

Deployed at https://master.d1ve5tin4apnez.amplifyapp.com/

This is an easy sheet music database so musicians can track what they own and have played with ease.

It has a database of already entered compositions for musicians to choose from for their personal library as well as an option to add new works into the database.
Filtering is available on the main catalog by title, composer, era, and genre.
Initially the catalog will show items from the local database. Items from the Open Opus API can be accessed by searching with the filter. This is done to limit number of entries shown. We don't want to put up the entire database.

Tests are in the folders with the files, they follow the format of `<filename>.test.js`. To run them type `jest <filename>.test.js`

Users will start on the homepage which provides them with a link to the main catalog, login, and signup pages.
After signing up for an account users can add compositions to their library from the main catalog, access the page to add new compositions from the main catalog, and edit the items in their library from their user library page.

My Sheet Music uses a PostgreSQL database, with a Javascript/Express controller. React is used for the frontend.

