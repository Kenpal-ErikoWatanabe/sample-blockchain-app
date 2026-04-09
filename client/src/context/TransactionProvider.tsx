/**
 * MetaMask 等の window.ethereum 経由で Sepolia に接続し、
 * コントラクトへ送金（writeContract）と件数参照（readContract）を行う Provider。
 */
import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  formatEther,
  getAddress,
  parseEther,
  type Address,
} from "viem";
import { sepolia } from "viem/chains";

import { contractABI, contractAddress } from "../utils/connect";
import { TransactionContext, type TransactionContextValue } from "./TransactionContext";

/** 拡張機能が注入する EIP-1193 プロバイダ（未インストール時は undefined）。モジュール内だけで使う（export しない）。 */
const { ethereum } = window as Window & { ethereum?: import("viem").EIP1193Provider };

/**
 * お金を動かす処理（送金など）をするときに使う。
 * MetaMask が画面で承認して、ブロックチェーンへ送るための入口。
 */
function getWalletClient() {
  // Check if MetaMask extension is installed
  if (!ethereum) throw new Error("イーサリアムオブジェクトがありません。");
  return createWalletClient({
    chain: sepolia,
    transport: custom(ethereum),
  });
}

/**
 * ブロックチェーンから情報を読むための入口。
 * 読み取り専用。レシート待ち・コントラクトの view 呼び出しに使う（署名は不要）。
 **/
function getPublicClient() {
  if (!ethereum) throw new Error("イーサリアムオブジェクトがありません。");
  return createPublicClient({
    chain: sepolia,
    transport: custom(ethereum),
  });
}

/**
 * TransactionContext の値を組み立て、子ツリーに提供するProvider。
 * ウォレット状態・フォーム・送金処理の単一の入口。
 */
export function TransactionProvider({ children }: { children: ReactNode }) {
  /** 接続済みアカウント（0x…）。未接続は空文字。 */
  const [currentAccount, setCurrentAccount] = useState("");
  /** フォーム入力。keyword / message は UI 用（コントラクト未送信のままでも可）。 */
  const [formData, setFormData] = useState<TransactionContextValue["formData"]>({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  /** writeContract 〜 receipt 待ちの間 true。 */
  const [isLoading, setIsLoading] = useState(false);
  /** オンチェーン取得後の件数。初回は localStorage のキャッシュを表示用に使う。 */
  const [transactionCount, setTransactionCount] = useState<string | null>(() =>
    localStorage.getItem("transactionCount"),
  );

  /** 名前付き input の controlled 更新（教材どおり 1 ハンドラで複数フィールド）。 */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, name: keyof TransactionContextValue["formData"]) => {
      setFormData((prev) => ({ ...prev, [name]: e.target.value }));
    },
    [],
  );

  /**
   * ページ読み込み時に、接続済みアカウントがあるか確認して復元する。
   * 確認だけなので、MetaMask のポップアップは出ない。
   */
  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      // Check if MetaMask extension is installed
      if (!ethereum) {
        return;
      }
      // get the permitted accounts of the user from MetaMask
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (import.meta.env.DEV) {
        console.log("[TransactionProvider] eth_accounts:", accounts);
      }
      if (Array.isArray(accounts) && accounts.length > 0) {
        setCurrentAccount(accounts[0] as string);
      } else {
        console.log("アカウントが見つかりませんでした");
      }
    } catch (err) {
      console.log(err);
      throw new Error("イーサリアムオブジェクトがありません。");
    }
  }, []);

  /**
   * ユーザー操作でウォレット接続。eth_requestAccounts で許可を求め、選択アカウントを state に反映。
   */
  const connectWallet = useCallback(async () => {
    try {
      // Check if MetaMask extension is installed
      if (!ethereum) {
        alert("メタマスクをインストールしてください");
        return;
      }
      // request permission to access the user's accounts from MetaMask
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (import.meta.env.DEV) {
        console.log("[TransactionProvider] eth_requestAccounts:", accounts);
      }
      // Check if the user has selected an account
      if (Array.isArray(accounts) && accounts.length > 0) {
        setCurrentAccount(accounts[0] as string);
      }
    } catch (err) {
      console.log(err);
      throw new Error("イーサリアムオブジェクトがありません。");
    }
  }, []);

  /**
   * addToBlockchain(receiver) を呼び出し、value として ETH を添付して送金する。
   * 流れ: writeContract → receipt 待ち → getTransactionCount で件数更新 → localStorage に保存。
   * keyword / message はここではオンチェーンに送らない（コントラクト ABI に合わせた形）。
   */
  const sendTransaction = useCallback(async () => {
    try {
      if (!ethereum) {
        alert("メタマスクをインストールしてください");
        return;
      }
      if (!currentAccount) {
        alert("ウォレットを接続してください");
        return;
      }

      const { addressTo, amount } = formData;
      if (!addressTo || !amount) {
        alert("送金先と金額を入力してください");
        return;
      }

      const walletClient = getWalletClient();
      const publicClient = getPublicClient();
      const receiver = getAddress(addressTo as Address);
      const amountWei = parseEther(amount);

      /** Sepolia でもガス代が別途かかる。これ未満だと MetaMask が「手数料 利用不可」になりやすい。 */
      const minGasBufferWei = parseEther("0.0001");

      const balance = await publicClient.getBalance({ address: currentAccount as Address });
      if (import.meta.env.DEV) {
        console.log(
          "[TransactionProvider] sendTransaction precheck:",
          "balance ETH =",
          formatEther(balance),
          "value ETH =",
          formatEther(amountWei),
          "from =",
          currentAccount,
        );
      }

      if (balance < amountWei) {
        alert(
          `このアカウントの Sepolia ETH が送金額より少ないです。\n\n残高: ${formatEther(balance)} ETH\n送金: ${formatEther(amountWei)} ETH\n\nAccount 1 と Account 2 は別ウォレットです。フォーセットで「送金に使うアカウント」へ ETH を入れてください。`,
        );
        return;
      }

      if (balance < amountWei + minGasBufferWei) {
        alert(
          `送金額＋ガス代をまとめて払えるか怪しい残高です（MetaMask で「ネットワーク手数料: 利用不可」になることがあります）。\n\n残高: ${formatEther(balance)} ETH\n送金: ${formatEther(amountWei)} ETH\n※ 目安として残り ${formatEther(minGasBufferWei)} ETH 以上の余裕を用意してください。`,
        );
        return;
      }

      try {
        await publicClient.simulateContract({
          account: currentAccount as Address,
          address: contractAddress as Address,
          abi: contractABI,
          functionName: "addToBlockchain",
          args: [receiver],
          value: amountWei,
        });
      } catch (simErr) {
        console.error("[TransactionProvider] simulateContract failed:", simErr);
        const detail = simErr instanceof Error ? simErr.message : String(simErr);
        alert(
          `オンチェーン実行のシミュレーションに失敗しました（このまま送ると失敗する可能性があります）。\n\n${detail}`,
        );
        return;
      }

      setIsLoading(true);

      const hash = await walletClient.writeContract({
        chain: sepolia,
        address: contractAddress as Address,
        abi: contractABI,
        functionName: "addToBlockchain",
        args: [receiver],
        value: amountWei,
        account: currentAccount as Address,
      });

      console.log(`ローディング - ${hash}`);
      await publicClient.waitForTransactionReceipt({ hash });
      console.log(`成功 - ${hash}`);

      const count = await publicClient.readContract({
        address: contractAddress as Address,
        abi: contractABI,
        functionName: "getTransactionCount",
      });

      const countStr = (count as bigint).toString();
      setTransactionCount(countStr);
      console.log(`countStr - ${countStr}`);

      localStorage.setItem("transactionCount", countStr);
      console.log(`localStorage に保存 - ${countStr}`);

    } catch (err) {
      console.error(err);
      const detail = err instanceof Error ? err.message : String(err);
      alert(`トランザクションに失敗しました。\n${detail}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentAccount, formData]);

  /** マウント時にだけ「前から接続されていたか」を確認。 */
  useEffect(() => {
    void checkIfWalletIsConnected();
  }, [checkIfWalletIsConnected]);

  /**
   * 開発時: currentAccount の現在値を追跡（接続・復元・アカウント切替のたびに更新される）。
   * 本番ビルドでは出力しない。
   */
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    console.log("[TransactionProvider] currentAccount:", currentAccount || "(未接続)");
  }, [currentAccount]);

  /** MetaMask でアカウントを切り替えたとき、接続中アドレスを同期する。 */
  useEffect(() => {
    if (!ethereum) return;
    const provider = ethereum as typeof ethereum & {
      on: (event: "accountsChanged", handler: (accounts: string[]) => void) => void;
      removeListener: (event: "accountsChanged", handler: (accounts: string[]) => void) => void;
    };
    if (typeof provider.on !== "function") return;

    const onAccountsChanged = (accounts: string[]) => {
      if (import.meta.env.DEV) {
        console.log("[TransactionProvider] accountsChanged (raw):", accounts);
      }
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
      } else {
        setCurrentAccount("");
      }
    };

    provider.on("accountsChanged", onAccountsChanged);
    return () => {
      provider.removeListener("accountsChanged", onAccountsChanged);
    };
  }, []);

  /** Context に載せるオブジェクト（TransactionContext.ts の型と一致させる）。 */
  const value: TransactionContextValue = {
    connectWallet,
    currentAccount,
    formData,
    setFormData,
    handleChange,
    sendTransaction,
    isLoading,
    transactionCount,
  };

  return (
    <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>
  );
}
