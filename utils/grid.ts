/**
 * Interface representing the row and column of a grid item.
 */
interface GridPosition {
  row: number;
  column: number;
}

/**
 * Calculates the row and column for a given 1-based index in a grid.
 *
 * @param index - The 1-based index of the grid item (1 to total items).
 * @param columns - Number of columns in the grid. Default is 3.
 * @returns An object containing the row and column numbers.
 * @throws Will throw an error if the index is less than 1.
 */
export function getRowAndColumn1Based(
  index: number,
  columns: number = 3
): GridPosition {
  if (index < 1) {
    throw new Error("Index must be 1 or greater for 1-based indexing.");
  }

  const row = Math.floor((index - 1) / columns) + 1;
  const column = ((index - 1) % columns) + 1;

  return { row, column };
}

/**
 * Calculates the row and column for a given 0-based index in a grid.
 *
 * @param index - The 0-based index of the grid item (0 to total items - 1).
 * @param columns - Number of columns in the grid. Default is 3.
 * @returns An object containing the row and column numbers.
 * @throws Will throw an error if the index is negative.
 */
export function getRowAndColumn0Based(
  index: number,
  columns: number = 3
): GridPosition {
  if (index < 0) {
    throw new Error("Index must be 0 or greater for 0-based indexing.");
  }

  const row = Math.floor(index / columns);
  const column = index % columns;

  return { row, column };
}
