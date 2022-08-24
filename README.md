# fairu  &middot; ![GitHub](https://img.shields.io/github/license/sevora/fairu) ![GitHub repo size](https://img.shields.io/github/repo-size/sevora/fairu)
An academic file indexing website.

## Overview
A file indexing website. Originally intended to index files in academia. It has a tagging function and a search feature. That's mostly about it. It also has a dashboard for admins to verify files.

## Screenshot
This is a screenshot of the mobile layout: <br />
![Fairu Screenshot](screenshot.png)

## Environment Variables
### Backend
This is a sample of the `.env` file required for this application:
```
# No need to explicitly define this on services such as Heroku
PORT=8000

# The MongoDB URL for the database connection
ATLAS_URI="mongodb+srv://username:password@cluster.mongodb.net/fairu-data?retryWrites=true&w=majority"

# This is used to enable Google Authorization feature
GOOGLE_CLIENT_ID="YOUR_CLIENT_ID_HERE"

# This is a very important string that the server will use for encryption
JWT_SECRET="a very long string"

```
