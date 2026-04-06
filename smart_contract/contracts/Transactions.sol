// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Transactions {
  // 仮想通貨の受け渡しのためのデータ構造(スキーマ)
  struct TransferStruct {
    address sender;
    address receiver;
    uint amount;
  }

  TransferStruct[] transactions;

  // 仮想通貨の受け渡しのイベント
  event Transfer(address sender, address receiver, uint amount);

  // 仮想通貨の受け渡しをブロックチェーンに追加する関数
  function addToBlockchain(address payable receiver, uint amount) public {
    transactions.push(TransferStruct(msg.sender, receiver, amount));
    emit Transfer(msg.sender, receiver, amount);
  }
}