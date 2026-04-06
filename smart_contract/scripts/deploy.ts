import { network } from "hardhat";

/**
 * Transactions コントラクトをデプロイするスクリプト（Hardhat 3 + Viem）
 *
 * Hardhat 2（Ethers）では `hre.ethers.getContractFactory("Transactions").deploy()` などと書くのに対し、
 * ここでは `network.connect()` で得た `viem.deployContract` でデプロイします。
 * デプロイ先のネットワークは CLI の `--network` で切り替えます（未指定ならプロジェクトのデフォルト）。
 *
 * 実行例:
 *   npx hardhat run scripts/deploy.ts
 *   npx hardhat run scripts/deploy.ts --network sepolia
 *   npm run deploy
 *
 * process.exit について:
 * Node.js のプロセスを指定した「終了コード」で即座に終了させる。
 * - exit(0) … 成功（Unix の慣例では 0 が成功）
 * - exit(1) … 失敗（0 以外はエラー。CI やシェルが `$?` で判別できる）
 */

/** ネットワークに接続して Transactions をデプロイし、アドレスを標準出力に出す */
async function main() {
  // 現在の --network に対応する接続。viem でデプロイ・読み取りができる
  const { viem } = await network.connect();

  // コンパイル済みコントラクト名でデプロイ（コンストラクタ引数は不要）
  const transactions = await viem.deployContract("Transactions");

  // フロントの .env やクライアント設定に渡すコントラクトアドレス
  console.log("Transactions deployed to:", transactions.address);
}

// main の成否に応じてプロセスの終了コードを付ける（未処理の例外を避ける）
main()
  .then(() => {
    // 正常終了を明示（終了コード 0 = 成功）
    process.exit(0);
  })
  .catch((err: unknown) => {
    // err: main 内で投げられた例外（型は不明なので unknown）
    // 失敗内容を標準エラーに出す（Hardhat 2 のスクリプトと同様のシンプルな形）
    console.error(err);
    // 異常終了を明示（終了コード 1 = 一般的なエラー）
    process.exit(1);
  });
