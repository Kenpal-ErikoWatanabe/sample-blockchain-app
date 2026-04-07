# Sample Hardhat 3 Beta Project (`node:test` and `viem`)

This project showcases a Hardhat 3 Beta project using the native Node.js test runner (`node:test`) and the `viem` library for Ethereum interactions.

To learn more about the Hardhat 3 Beta, please visit the [Getting Started guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3). To share your feedback, join our [Hardhat 3 Beta](https://hardhat.org/hardhat3-beta-telegram-group) Telegram group or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new) in our GitHub issue tracker.

## Project Overview

This example project includes:

- A simple Hardhat configuration file.
- Foundry 互換の Solidity テスト（`contracts/Transactions.t.sol`）。`npx hardhat test solidity` で実行。
- TypeScript integration tests using [`node:test`](nodejs.org/api/test.html), the new Node.js native test runner, and [`viem`](https://viem.sh/).
- Examples demonstrating how to connect to different types of networks, including locally simulating OP mainnet.

## 環境変数（Sepolia）

`hardhat.config.ts` の `networks.sepolia` は [Configuration Variables](https://hardhat.org/docs/guides/configuration-variables) として次の名前を参照します。

| 変数名 | 用途 |
|--------|------|
| `SEPOLIA_RPC_URL` | Sepolia への JSON-RPC（例: Alchemy の `https://eth-sepolia.g.alchemy.com/v2/...`） |
| `SEPOLIA_PRIVATE_KEY` | デプロイ等でトランザクションに署名するアカウントの秘密鍵（`0x` 付き hex） |

プロジェクト直下に **`.env`** を置き、上記を設定してください。テンプレートは **`.env.example`** をコピーして使えます。

```shell
cp .env.example .env
# .env を編集して値を入れる（.env は .gitignore 済み）
```

`hardhat.config.ts` 先頭で `dotenv` を読み込んでいるため、**`npx hardhat` 実行時に `process.env` 経由で値が渡ります。** 別の方法として `npx hardhat keystore set SEPOLIA_RPC_URL` なども利用できます。

---

## Usage

### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

You can also selectively run the Solidity or `node:test` tests:

```shell
npx hardhat test solidity
npx hardhat test nodejs
```

### Make a deployment to Sepolia

This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.

To run the deployment to a local chain:

```shell
npx hardhat ignition deploy ignition/modules/Transactions.ts
```

To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

After setting the variable, you can run the deployment with the Sepolia network:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/Transactions.ts
```
