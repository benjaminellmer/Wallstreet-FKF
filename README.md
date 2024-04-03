# Wallstreet-FKF

Wallstreet-FKF is a dynamic bar pricing software designed to bring a stock market vibe to your bar. It features a variety of tools to manage and display drink prices, influenced by real-time demand.

## Key Features

1. **Dynamic Pricing Engine**
   - Automatically adjusts drink prices based on demand.
   - Price update intervals are customizable through the admin tool.

2. **Admin Tool**
   - Set and modify base and maximum drink prices.
   - Initiate a "stock crash" event, lowering prices to their minimum.
   - Update drink availability status.
   - Apply specific discounts or surcharges on certain drinks.
   - Adjust the frequency of price updates.

3. **Order Platform for Waiters**
   - User-friendly interface for order placement.
   - Price "freeze" feature to honor the price at the time of order.

4. **Guest Interface**
   - Displays the current prices of drinks.
   - Includes price trend graphs for each drink, showing changes throughout the event.

5. **Additional Features**
   - Supply and Demand Indicators: Identifies trending or unpopular drinks.
   - Special Event: "Market Crash" where all drinks hit their lowest price for a limited time.

## Technology Stack

- **Backend**: Node.js 
  - [Installation Guide](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs)
  - Start the server with `node server.js`
  - access with http://127.0.0.1:3000
- **Frontend**: Svelte
  - Start frontend with `npm run dev`
  - access with http://127.0.0.1:8080
  - **Note: only accassible with ip not localhost!!!**
- **Database**: Currently using SQLite (subject to change)

## Dependencies

install node.js. An install all dependencies with `npm install`

### Backend

- body-parser@1.20.2
- chalk@5.3.0
- colors@1.4.0
- cors@2.8.5
- express@4.19.2
- node-cron@3.0.3
- sequelize@6.37.2
- socket.io@4.7.5
- sqlite3@5.1.7

### Frontend

- axios@1.6.8
- rollup@3.29.4
- socket.io-client@4.7.5
- svelte-routing@2.12.0
- svelte-spa-router@4.0.1
- svelte@3.59.2
