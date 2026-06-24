export type ReadResponse<T> = {
  data: T;
  fetchedAt: string;
};

export function readResponse<T>(
  data: T,
  cacheControl = "public, s-maxage=60, stale-while-revalidate=300"
) {
  return Response.json(
    {
      data,
      fetchedAt: new Date().toISOString()
    } satisfies ReadResponse<T>,
    {
      headers: {
        "Cache-Control": cacheControl
      }
    }
  );
}
