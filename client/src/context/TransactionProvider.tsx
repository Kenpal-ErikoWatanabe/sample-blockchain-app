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
  getAddress,
  parseEther,
  type Address,
} from "viem";
import { sepolia } from "viem/chains";

import { contractABI, contractAddress } from "../utils/connect";
import { TransactionContext, type TransactionContextValue } from "./TransactionContext";

/** 拡張機能が注入する EIP-1193 プロバイダ（未インストール時は undefined） */
const { ethereum } = window as Window & { ethereum?: import("viem").EIP1193Provider };

/** 署名付きトランザクション送信用。MetaMask 等のウォレットに送信を依頼する。 */
function getWalletClient() {
  if (!ethereum) throw new Error("イーサリアムオブジェクトがありません。");
  return createWalletClient({
    chain: sepolia,
    transport: custom(ethereum),
  });
}

/** 読み取り専用。レシート待ち・コントラクトの view 呼び出しに使う（署名は不要）。 */
function getPublicClient() {
  if (!ethereum) throw new Error("イーサリアムオブジェクトがありません。");
  return createPublicClient({
    chain: sepolia,
    transport: custom(ethereum),
  });
}

/**
 * TransactionContext の値を組み立て、子ツリーに提供する。
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
   * ページ読み込み時: 既に許可済みなら eth_accounts でアドレスを復元（再ログインなし）。
   * eth_requestAccounts とは異なり、ユーザーにプロンプトを出さない。
   */
  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      if (!ethereum) {
        return;
      }
      const accounts = await ethereum.request({ method: "eth_accounts" });
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
      if (!ethereum) {
        alert("メタマスクをインストールしてください");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (Array.isArray(accounts) && accounts.length > 0) {
        setCurrentAccount(accounts[0] as string);
      }
    } catch (err) {
      console.log(err);
      throw new Error("イーサリアムオブジェクトがありません。");
    }
  }, []);

  /**
   * addToBlockchain(receiver, amount) を送金。流れ:
   * writeContract → receipt 待ち → getTransactionCount で件数更新 → localStorage に保存。
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

      setIsLoading(true);

      const hash = await walletClient.writeContract({
        chain: sepolia,
        address: contractAddress as Address,
        abi: contractABI,
        functionName: "addToBlockchain",
        args: [receiver, amountWei],
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
      localStorage.setItem("transactionCount", countStr);
    } catch (err) {
      console.log(err);
      throw new Error("トランザクションに失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }, [currentAccount, formData]);

  /** マウント時にだけ「前から接続されていたか」を確認。 */
  useEffect(() => {
    void checkIfWalletIsConnected();
  }, [checkIfWalletIsConnected]);

  /** Context に載せるオブジェクト（transaction-context.ts の型と一致させる）。 */
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
