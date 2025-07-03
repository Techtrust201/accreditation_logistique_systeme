export type SearchParams = Record<string, string | undefined>;

export function buildLink(
  params: SearchParams,
  page: number,
  overrides: Record<string, string> = {}
) {
  const qs = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
      return acc;
    }, {})
  );
  qs.set("page", String(page));
  for (const [k, v] of Object.entries(overrides)) {
    if (v === undefined) qs.delete(k);
    else qs.set(k, v);
  }
  return `/logisticien?${qs.toString()}`;
}
