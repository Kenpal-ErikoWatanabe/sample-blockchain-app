// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/// @title 送金履歴をオンチェーンに記録するコントラクト
/// @notice 呼び出し時に送られた ETH を受取人へ転送し、履歴を保存する
contract Transactions {
  // 仮想通貨の受け渡しのためのデータ構造(スキーマ)
  struct TransferStruct {
    address sender; // 送金を実行したアカウント（addToBlockchain を呼んだ人 = msg.sender）
    address receiver; // 送金先のアカウント
    uint amount; // 実際に転送した ETH 量（wei）
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
  /// @notice msg.value の ETH を receiver へ転送し、送金情報を配列に追加して Transfer イベントを発行する
  /// @param receiver 送金先
  function addToBlockchain(address payable receiver) public payable {
    require(msg.value > 0, "No ETH sent");

    (bool ok,) = receiver.call{value: msg.value}("");
    require(ok, "ETH transfer failed");

    transactions.push(TransferStruct(msg.sender, receiver, msg.value));
    emit Transfer(msg.sender, receiver, msg.value);
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
