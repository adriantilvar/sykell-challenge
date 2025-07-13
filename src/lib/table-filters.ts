import { type RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import type { FilterFn } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
    numerical: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

export const fuzzyFilter: FilterFn<unknown> = (
  row,
  columnId,
  value,
  addMeta
) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });

  return itemRank.passed;
};

export const numberFilter: FilterFn<unknown> = (row, columnId, value) => {
  const columnNumericalValue = Number(row.getValue(columnId));
  const numericalValue = Number(value);

  if (Number.isNaN(columnNumericalValue) || Number.isNaN(numericalValue))
    return false;

  return columnNumericalValue === numericalValue;
};
