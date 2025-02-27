import { createSelector } from 'reselect';
import { Collection, Map as ImmutableMap, List } from 'immutable';

import { TRANSACTION_STATUSES } from '~types';

import { TransactionRecord } from '../immutable';

import { RootStateRecord } from '../state';
import { TransactionsListMap } from '../state/transactions';
import { CORE_TRANSACTIONS, CORE_TRANSACTIONS_LIST } from '../constants';

import { messageGroups } from './messages';

/*
 * Transactions sorting functions.
 */
const createdAtDesc = (
  { createdAt: createdAtA }: TransactionRecord,
  { createdAt: createdAtB }: TransactionRecord,
) => createdAtB.getTime() - createdAtA.getTime();

/*
 * Transactions selectors.
 */
export const oneTransaction = (
  state: RootStateRecord,
  id: string,
): TransactionRecord | undefined =>
  state.getIn([
    CORE_TRANSACTIONS,
    CORE_TRANSACTIONS_LIST,
    id,
  ]) as TransactionRecord;

const allTransactions = (state: RootStateRecord): TransactionsListMap =>
  state.getIn([
    CORE_TRANSACTIONS,
    CORE_TRANSACTIONS_LIST,
  ]) as TransactionsListMap;

export const transactionByHash = (state: RootStateRecord, hash: string) =>
  createSelector(allTransactions, (transactions) =>
    transactions.find((tx) => tx.hash === hash),
  )(state);

export const groupedTransactions = createSelector(
  allTransactions,
  (transactions) =>
    transactions
      // Create groups of transations which have 'em
      .groupBy((tx) => tx.group && tx.group.id)
      // Convert groups to lists and sort by no in group
      .map((txGroup) =>
        txGroup.toList().sortBy((tx) => tx.group && tx.group.index),
      )
      // Merge the ungrouped transactions into the ordered map.
      // It's important that all iterators here have the same type (OrderedMap)
      // For proper typing we create single value arrays for all of the
      // single transactions.
      // The output of allTransactions always has a string id in group.
      .flatMap((value: List<TransactionRecord>, key: string) =>
        !key ? value.groupBy((tx) => tx.id) : ImmutableMap({ [key]: value }),
      )
      .toList()
      // Finally sort by the createdAt field in the first transaction of the group
      .sortBy(
        (group) => (group.first() as TransactionRecord).createdAt,
        // Descending createdAt order (most recent groups first)
        (createdAtA, createdAtB) => Number(createdAtB) - Number(createdAtA),
      ),
);

export const pendingTransactions = createSelector(
  allTransactions,
  (transactions) =>
    transactions
      .filter((tx) => tx.status === TRANSACTION_STATUSES.PENDING)
      .sort(createdAtDesc),
);

/*
 * @NOTE This selector merges both the transaction groups and message groups
 * into one list and sorts, in order to be digested by the Gas Station
 */
export const groupedTransactionsAndMessages = createSelector(
  groupedTransactions,
  messageGroups,
  (transactions, messages) =>
    transactions
      .concat(messages)
      /*
       * Final sort is required since both the transactions and messages are
       * sorted individually, so without this, the list will just show transactions
       * at the top and messages at the bottom
       */
      .sortBy(
        (group: Collection<number, TransactionRecord>) =>
          (group.first() as TransactionRecord).createdAt,
        // Descending createdAt order (most recent groups first)
        (createdAtA, createdAtB) => Number(createdAtB) - Number(createdAtA),
      ),
);
