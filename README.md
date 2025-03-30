# DeFi Tracker

A sophisticated real-time DeFi asset tracking platform that provides comprehensive portfolio management and advanced blockchain asset insights. The application enables users to monitor cryptocurrency performance, track trending assets, and manage their digital investment portfolio with precision and visual clarity.

## Features

- **Real-time Price Tracking**: Monitor cryptocurrency performance with up-to-date market data
- **Portfolio Management**: Track your digital assets across multiple blockchains
- **Wallet Integration**: Connect your blockchain wallets for automatic balance updates
- **Trending Assets**: Discover the most popular cryptocurrencies in the market
- **Market News**: Stay informed with the latest cryptocurrency and blockchain news
- **Multi-chain Support**: Track assets across Ethereum, Solana, and more
- **Visual Price Charts**: Analyze price movements with interactive sparkline charts
- **User Authentication**: Secure access to your portfolio with user accounts

## Tech Stack

- **Frontend**: React, TypeScript, Shadcn/UI, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js
- **Blockchain Connectivity**: Web3.js, Ethers.js, @solana/web3.js
- **State Management**: React Query
- **Data Visualization**: Recharts
- **Styling**: Tailwind CSS with component variants

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run development server: `npm run dev`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/defitracker
SESSION_SECRET=your_session_secret
PORT=3000
```

For wallet connections:
```
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

## Project Structure

```
/
├── client/           # Frontend React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions and configurations
│   │   ├── pages/       # Application pages
│   │   └── types/       # TypeScript type definitions
├── db/               # Database schema and configuration
├── server/           # Backend Express application
│   ├── routes.ts     # API routes
│   ├── auth.ts       # Authentication logic
│   └── index.ts      # Server entry point
└── public/           # Static assets
```

## API Endpoints

- `GET /api/user` - Get current user information
- `POST /api/login` - Authenticate user
- `POST /api/register` - Register new user
- `GET /api/portfolio` - Get user portfolio data
- `POST /api/portfolio/assets` - Add asset to portfolio
- `POST /api/portfolio/wallets` - Add wallet to portfolio
- `POST /api/portfolio/refresh-balances` - Refresh wallet balances

## License

MIT