/**
 * Files passed from one tool to another, such as a site's ZIP chosen in the Search Console
 * tool that the page review should check instead. They stay in this tab's memory only, and
 * the receiving tool takes them exactly once.
 */
let pending: readonly File[] | null = null;

export function handOff(files: readonly File[]): void {
  pending = files;
}

export function takeHandOff(): readonly File[] | null {
  const files = pending;
  pending = null;
  return files;
}
