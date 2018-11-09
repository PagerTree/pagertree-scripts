# Daily Incident Report
A small script that collects a days worth of incidents from [PagerTree](https://pagertree.com) and exports them to a .csv file.

## Install
You'll need [NodeJS 7.6](https://nodejs.org/en/download/) or higher.

```
npm i
```

## Run

```
mv .env.template .env
# Add your username + password to the .env file
node index.js
```

This will create a csv file in the current directory
