/** Offers text to the person as a file download. The file is created locally, never uploaded. */
export function downloadText(fileName: string, text: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  // Give the browser time to start the download before releasing the file.
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 10_000);
}
