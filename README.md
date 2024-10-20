# NFT Rental System

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Usage](#usage)
6. [Smart Contract Overview](#smart-contract-overview)
7. [Function Details](#function-details)
8. [Testing](#testing)
9. [Security Considerations](#security-considerations)
10. [Future Improvements](#future-improvements)
11. [Contributing](#contributing)
12. [License](#license)

## Introduction

The NFT Rental System is a smart contract implemented in Clarity for the Stacks blockchain. It allows NFT owners to rent out their NFTs to other users for a specified period and price. This system provides a way to monetize NFT ownership without permanently transferring the asset.

## Features

- Create rental listings for NFTs
- Rent NFTs for a specified duration
- End rentals after the rental period
- Cancel unrented listings
- Automated handling of rental payments

## Prerequisites

- Stacks blockchain environment
- Clarity smart contract language knowledge
- [Clarinet](https://github.com/hirosystems/clarinet) for local development and testing

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/scholastica25/nft-rental-system.git
   cd nft-rental-system
   ```

2. Install Clarinet by following the instructions in the [official documentation](https://docs.hiro.so/smart-contracts/clarinet).

3. Initialize a new Clarinet project:
   ```
   clarinet new nft-rental-system
   ```

4. Copy the smart contract code into the `contracts/nft-rental-system.clar` file.

## Usage

To interact with the smart contract, you can use the Clarinet console or deploy it to the Stacks blockchain.

### Local Testing with Clarinet

1. Start the Clarinet console:
   ```
   clarinet console
   ```

2. In the console, you can call contract functions. For example:
   ```clarity
   (contract-call? .nft-rental-system create-rental u1 u100 u1000000)
   ```

### Deployment

To deploy the contract to the Stacks blockchain:

1. Configure your Stacks wallet in Clarinet.
2. Run the deployment command:
   ```
   clarinet deploy
   ```

## Smart Contract Overview

The smart contract consists of the following main components:

1. Constants for error handling
2. Data variables and maps for storing rental information
3. Non-fungible token definition for representing rentals
4. Read-only functions for querying rental data
5. Public functions for creating, renting, ending, and canceling rentals

## Function Details

### create-rental
Creates a new rental listing for an NFT.
- Parameters: 
  - `token-id`: uint (The ID of the NFT to be rented)
  - `duration`: uint (The rental duration in blocks)
  - `price`: uint (The rental price in microSTX)
- Returns: uint (The newly created rental ID)

### rent-nft
Allows a user to rent an available NFT.
- Parameters:
  - `rental-id`: uint (The ID of the rental to be rented)
- Returns: boolean (true if successful)

### end-rental
Ends a rental after the rental period has expired.
- Parameters:
  - `rental-id`: uint (The ID of the rental to be ended)
- Returns: boolean (true if successful)

### cancel-rental
Allows the owner to cancel an unrented listing.
- Parameters:
  - `rental-id`: uint (The ID of the rental to be canceled)
- Returns: boolean (true if successful)

## Testing

To run the included tests:

1. Navigate to the project directory.
2. Run the test command:
   ```
   clarinet test
   ```

## Security Considerations

- Ensure that only the contract owner can create rental listings.
- Implement proper access controls for ending rentals and transferring NFTs.
- Consider implementing a secure upgrade pattern for future contract updates.
- Thoroughly test all functions, especially those involving token transfers and state changes.

## Future Improvements

1. Implement a fee system for the platform.
2. Add support for different payment tokens.
3. Create a more sophisticated rental duration system, possibly using absolute timestamps.
4. Implement events to track rental activities for better off-chain indexing.
5. Add a dispute resolution mechanism for conflicts between renters and owners.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with clear, descriptive messages.
4. Push your changes to your fork.
5. Submit a pull request with a clear description of your changes.

