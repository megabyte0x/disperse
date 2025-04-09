# Disperse App Clone

A decentralized application that allows users to distribute ETH or ERC20 tokens to multiple addresses in a single transaction. Built on [Base](https://base.org).

![Disperse App Screenshot](public/screenshot.png)

## Features

- Distribute ETH or any ERC20 token to multiple addresses in one transaction
- Simple user interface for entering recipient addresses and amounts
- Support for both standard and simple token transfer methods
- Real-time validation of addresses and transaction data
- Transaction status tracking

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Blockchain Connectivity**: wagmi, viem, MiniKit from OnchainKit
- **Contract**: Solidity smart contract compatible with EVM chains

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- A wallet with Base testnet or mainnet ETH (like Coinbase Wallet or MetaMask)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/disperse-clone.git
   cd disperse-clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key
   NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=Disperse App
   NEXT_PUBLIC_URL=http://localhost:3000
   NEXT_PUBLIC_VERSION=vNEXT
   NEXT_PUBLIC_IMAGE_URL=http://localhost:3000/base-logo.svg
   NEXT_PUBLIC_SPLASH_IMAGE_URL=http://localhost:3000/base-logo.svg
   NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR=0052FF
   NEXT_PUBLIC_ICON_URL=http://localhost:3000/base-logo.svg
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to http://localhost:3000

## Usage

1. Connect your wallet
2. Enter the token address (leave blank for ETH)
3. Enter recipient addresses and amounts in the format:
   ```
   0x1234... 1.5
   0x5678... 2.25
   0x9abc... 0.5
   ```
4. Choose between standard or simple token transfer method (for tokens only)
5. Click "Disperse Tokens" to execute the transaction

## Deployed Contract

The Disperse contract is deployed at `0x3e59c87d81a21cc9ff818e85db23715d362c8faa` on the Base network.

## License

MIT

## Acknowledgements

- Original [Disperse.app](https://disperse.app) concept
- [Base](https://base.org) for the L2 infrastructure
- [Coinbase Wallet](https://www.coinbase.com/wallet) and [OnchainKit](https://docs.onchainkit.com/)
