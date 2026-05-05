import type { Request } from "express";

export type PaginationQuery = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 1 | -1;
};

type PaginationOptions = {
  defaultSortBy: string;
  allowedSortBy: string[];
};

export type PaginatorView<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
};

function readQueryString(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return null;
}

function parsePositiveInt(value: unknown, fallback: number): number {
  const str = readQueryString(value);
  if (!str) {
    return fallback;
  }

  const parsed = Number.parseInt(str, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export function parsePaginationQuery(
  req: Request,
  options: PaginationOptions,
): PaginationQuery {
  const pageNumber = parsePositiveInt(req.query.pageNumber, 1);
  const pageSize = parsePositiveInt(req.query.pageSize, 10);

  const requestedSortBy = readQueryString(req.query.sortBy);
  const sortBy =
    requestedSortBy && options.allowedSortBy.includes(requestedSortBy)
      ? requestedSortBy
      : options.defaultSortBy;

  const sortDirectionRaw = readQueryString(req.query.sortDirection);
  const sortDirection: 1 | -1 = sortDirectionRaw === "asc" ? 1 : -1;

  return {
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  };
}

export function buildPaginatorView<T>(
  items: T[],
  totalCount: number,
  page: number,
  pageSize: number,
): PaginatorView<T> {
  return {
    pagesCount: Math.ceil(totalCount / pageSize),
    page,
    pageSize,
    totalCount,
    items,
  };
}
