export function simetricsCacheProfile(
  dateIso: string,
  currentDateIso: string
): "rapid" | "historical" {
  return dateIso.slice(0, 10) === currentDateIso.slice(0, 10)
    ? "rapid"
    : "historical";
}
