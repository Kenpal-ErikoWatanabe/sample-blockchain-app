import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TransactionsModule", (m) => {
  const transactions = m.contract("Transactions");

  return { transactions };
});
