export function parsePagination(
  searchParams: URLSearchParams,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {},
) {
  const page = Math.max(
    1,
    parseInt(searchParams.get("page") ?? "", 10) || (defaults.page ?? 1),
  );
  const maxLimit = defaults.maxLimit ?? 50;
  const rawLimit =
    parseInt(searchParams.get("limit") ?? "", 10) || (defaults.limit ?? 20);
  const limit = Math.min(maxLimit, Math.max(1, rawLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function paginatedMeta(total: number, page: number, limit: number) {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}
