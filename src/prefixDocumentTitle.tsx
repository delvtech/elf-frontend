export function prefixDocumentTitle(): void {
  if (process.env.NODE_ENV === "development") {
    const prefix = "(D)";
    document.title = `${prefix} ${document.title}`;
  }
}
