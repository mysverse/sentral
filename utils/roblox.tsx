const regex = /https:\/\/(?:www\.)?roblox\.com\/catalog\/(\d+)(?:\/[\w-]+)?/g;

export function extractRobloxIDs(text: string): number[] {
  const ids: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    ids.push(match[1]); // match[1] contains the captured numeric ID
  }

  return Array.from(new Set(ids)).map((id) => parseInt(id)); // Remove duplicates
}
