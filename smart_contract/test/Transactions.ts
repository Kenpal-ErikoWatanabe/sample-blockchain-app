import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { getAddress } from "viem";

describe("Transactions", async function () {
  const { viem } = await network.connect();

  it("Should emit Transfer when addToBlockchain is called", async function () {
    const transactions = await viem.deployContract("Transactions");
    const [senderClient, receiverClient] = await viem.getWalletClients();

    const amount = 100n;

    await viem.assertions.emitWithArgs(
      transactions.write.addToBlockchain([
        receiverClient.account.address,
        amount,
      ]),
      transactions,
      "Transfer",
      [
        getAddress(senderClient.account.address),
        getAddress(receiverClient.account.address),
        amount,
      ],
    );
  });

  it("Should record sender, receiver, and amount", async function () {
    const transactions = await viem.deployContract("Transactions");
    const [, receiverClient] = await viem.getWalletClients();
    const amount = 42n;

    const hash = await transactions.write.addToBlockchain([
      receiverClient.account.address,
      amount,
    ]);

    const publicClient = await viem.getPublicClient();
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    assert.equal(receipt.status, "success");
  });
});
