// 取引 UI 用の React Context の型定義とフック。
// 実際のウォレット接続・Viem 呼び出しは TransactionProvider に置く（関心の分離）。

import { createContext, useContext, type ChangeEvent, type Dispatch, type SetStateAction } from "react";

/** 送金フォームの入力状態（文字列のまま保持し、送金時に parse などへ渡す） */
export type FormData = {
  addressTo: string;
  amount: string;
  keyword: string;
  message: string;
};

// Context が公開する値の形。Provider が state とハンドラを束ねてここに載せる。
// - null ではない値: TransactionProvider 配下で利用可能
// - TransactionContext 自体は TransactionContextValue | null（React の慣習: 未マウント時は null）
export type TransactionContextValue = {
  connectWallet: () => Promise<void>;
  currentAccount: string;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  handleChange: (e: ChangeEvent<HTMLInputElement>, name: keyof FormData) => void;
  sendTransaction: () => Promise<void>;
  isLoading: boolean;
  /** コントラクトから読んだ件数など。未取得は null */
  transactionCount: string | null;
};

// コンテキスト本体。初期値は null（Provider 外では値がない）。子は useTransactionContext 経由で取得。
export const TransactionContext = createContext<TransactionContextValue | null>(null);

// Provider 内では常に TransactionContextValue を返す。Provider 外では例外を投げる（null を握りつぶさない）。
export function useTransactionContext(): TransactionContextValue {
  const ctx = useContext(TransactionContext);
  if (!ctx) {
    throw new Error("useTransactionContext must be used within TransactionProvider");
  }
  return ctx;
}
