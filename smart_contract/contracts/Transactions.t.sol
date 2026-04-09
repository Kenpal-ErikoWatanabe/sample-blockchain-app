// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Transactions} from "./Transactions.sol";
import {Test} from "forge-std/Test.sol";

/// @title Transactions の Foundry 形式テスト
/// @dev `forge test` でも、Hardhat では `npx hardhat test solidity` で実行できます。
///      `test` で始まる関数が個別のテストケースになります。
contract TransactionsTest is Test {
  /// @notice vm.expectEmit と突き合わせるためのイベント宣言（`Transactions.Transfer` と同じ形）
  event Transfer(address sender, address receiver, uint256 amount);

  /// @notice テスト対象のコントラクト（setUp で毎回デプロイし直す）
  Transactions internal transactionsContract;

  /// @notice 送り手として使うダミーアドレス（vm.prank で msg.sender にする）
  address internal alice = address(0xA11CE);

  /// @notice 受け取り側として使うダミーアドレス
  address internal bob = address(0xB0B);

  /// @notice 各テストの前に実行される。新しい Transactions をデプロイして初期状態をそろえる
  function setUp() public {
    transactionsContract = new Transactions();
  }

  /// @notice デプロイ直後は送金記録が 0 件であることを確認する
  function test_InitialCountIsZero() public view {
    assertEq(transactionsContract.getTransactionCount(), 0);
  }

  /// @notice addToBlockchain が配列に 1 件追加し、sender / receiver / amount が意図どおり保存されることを確認する
  function test_AddToBlockchainAppendsTransfer() public {
    vm.deal(alice, 1 ether);
    vm.prank(alice);
    transactionsContract.addToBlockchain{value: 100}(payable(bob));

    assertEq(transactionsContract.getTransactionCount(), 1);

    Transactions.TransferStruct memory t = transactionsContract.getTransaction(0);
    assertEq(t.sender, alice);
    assertEq(t.receiver, bob);
    assertEq(t.amount, 100);
  }

  /// @notice addToBlockchain 実行時に Transfer イベントが正しい引数で emit されることを確認する
  /// @dev コントラクト側の Transfer に indexed がないため、vm.expectEmit(false, false, false, true) でデータ部のみ検証
  function test_AddToBlockchainEmitsTransfer() public {
    vm.deal(alice, 1 ether);
    vm.expectEmit(false, false, false, true);
    emit Transfer(alice, bob, 50);

    vm.prank(alice);
    transactionsContract.addToBlockchain{value: 50}(payable(bob));
  }
}
