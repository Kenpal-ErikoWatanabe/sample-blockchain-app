import contractABI from "./Transaction.json";

export { contractABI };

/**
 * Sepolia にデプロイした Transactions コントラクトのアドレス。
 * ウォレット（EOA）のアドレスを入れないこと — エラー「External transactions to internal accounts cannot include data」になる。
 *
 * client/.env に例: VITE_CONTRACT_ADDRESS=0x...
 * 取得: smart_contract で `npx hardhat run scripts/deploy.ts --network sepolia` のログ「Transactions deployed to:」
 */
const raw = import.meta.env.VITE_CONTRACT_ADDRESS;

if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) {
  throw new Error(
    "VITE_CONTRACT_ADDRESS を client/.env に設定してください（デプロイ済み Transactions のアドレス。ウォレットアドレスではありません）。",
  );
}

export const contractAddress = raw as `0x${string}`;
