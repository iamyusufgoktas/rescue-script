# 🛠️ Rescue.js – BSC Token Recovery Script

A tiny utility that helps you _safely_ rescue ERC-20 tokens from a compromised Binance Smart Chain (BSC) wallet. The script sends two consecutive transactions—(1) fund gas, (2) transfer tokens—to beat frontrunning bots. These usually settle within adjacent blocks. For **true same-block atomicity** you must relay the pair as a bundle via an MEV service (e.g., Flashbots or its BSC equivalents).


## ⚡ Quick Start

1. **Clone & install**
   ```bash
   git clone https://github.com/iamyusufgoktas/rescue-script.git
   cd rescue-script
   npm install
   ```
2. **Create an `.env` file**
   ```env
   # Wallet that already has BNB and is under your control
   SAFE_PRIVATE_KEY=YOUR_SAFE_WALLET_PRIVATE_KEY

   # Wallet whose private key was leaked (holds the tokens)
   COMPROMISED_PRIVATE_KEY=YOUR_COMPROMISED_WALLET_PRIVATE_KEY

   # Safe wallet
   SAFE_WALLET=YOUR_SAFE_WALLET

   # Compromised wallet
   COMPROMISED_WALLET=YOUR_COMPROMISED_WALLET

   # Token address
   TOKEN_ADDRESS=YOUR_TOKEN_ADDRESS
   ```
3. **Run**
   ```bash
   node rescue.js            # default => bundleRescue()
   # OR, inside the script, comment-in simpleRescue() if you prefer
   ```

If everything is configured correctly you’ll see detailed balance diagnostics followed by the bundled rescue transactions and a final balance check.


---

## 📈 Successful Rescue Example

This script has already been successfully used to rescue real tokens from a compromised wallet on BSC.

Here are two confirmed transactions:

- [Funding Transaction (BNB sent to compromised wallet)](https://bscscan.com/tx/0xf486ae4ad8157d1e038796ea9c12b46ea1ece90c5a07ec260d2868f8b91e564a)
- [Token Transfer (rescued tokens to safe wallet)](https://bscscan.com/tx/0x9e878463816461ee8db0d3085b49df25e4d3b23f9cde95eb43ba0b1134fb93e2)

These transactions landed in adjacent blocks, beating frontrunning bots.

> ✅ _Tokens successfully recovered to a safe wallet in a real-world scenario._


## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `web3`  | Interact with BSC JSON-RPC, sign and send txs |
| `dotenv`| Load the private keys from a local `.env` file |

Install them (already handled by `npm install`):
```bash
npm install web3 dotenv
```

---

## 🔐 Safety checklist

* **KEEP `.env` PRIVATE** – Add it to `.gitignore` so secrets never reach the repo.
* Use a fresh **SAFE wallet** with enough BNB only for gas.
* Test on BSC testnet first by switching the RPC URL in `rescue.js`.
* Read and understand the code before running—_you are signing transactions with your keys._