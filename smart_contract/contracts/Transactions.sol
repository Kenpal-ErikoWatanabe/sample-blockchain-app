// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/// @title 送金履歴をオンチェーンに記録するコントラクト
/// @notice 実際のトークン移転は行わず、誰が誰にいくら送ったかのメタデータとイベントだけを残す（教材向けの簡易モデル）
contract Transactions {
  // 仮想通貨の受け渡しのためのデータ構造(スキーマ)
  struct TransferStruct {
    address sender; // 送金を実行したアカウント（addToBlockchain を呼んだ人 = msg.sender）
    address receiver; // 送金先のアカウント
    uint amount; // 送った量（トークンや ETH の単位はコントラクト外の約束に依存）
  }

  /// @notice これまでに記録された送金の一覧（追加順。ブロックチェーン上に永続化される）
  TransferStruct[] transactions;

  // 仮想通貨の受け渡しのイベント
  /// @notice 送金が記録されたときにオフチェーン向けに発火するログ
  /// @param sender 送り手（addToBlockchain の呼び出し元）
  /// @param receiver 受け取り手
  /// @param amount 送金量
  event Transfer(address sender, address receiver, uint amount);

  // 仮想通貨の受け渡しをブロックチェーンに追加する関数
  /// @notice 送金情報を配列に追加し、Transfer イベントを発行する
  /// @param receiver 送金先（payable はアドレス型の都合。ETH を送る処理はこのコントラクトには含まれない）
  /// @param amount 送金量（意味づけはアプリ側で決める）
  function addToBlockchain(address payable receiver, uint amount) public {
    transactions.push(TransferStruct(msg.sender, receiver, amount));
    emit Transfer(msg.sender, receiver, amount);
  }

  /// @notice 記録済みの送金が何件あるか（配列 transactions の長さ）
  function getTransactionCount() external view returns (uint256) {
    return transactions.length;
  }

  /// @notice 記録の「何番目か」を指定して、1 件分の TransferStruct を返す（0 が最初の取引）
  /// @param index 0 始まり。件数以上を指定するとリバートする
  function getTransaction(uint256 index) external view returns (TransferStruct memory) {
    return transactions[index];
  }
}
