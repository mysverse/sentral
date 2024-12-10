export function replaceHttpWithWs(urlString: string): string {
  try {
    const url = new URL(urlString);

    if (url.protocol === "http:") {
      url.protocol = "ws:";
    } else if (url.protocol === "https:") {
      url.protocol = "wss:";
    } else {
      throw new Error(`Unsupported protocol: ${url.protocol}`);
    }

    return url.toString();
  } catch (error) {
    console.error(`Invalid URL: ${urlString}`, error);
    throw error;
  }
}

export function addPathToUrl(originalUrl: string, newPath: string) {
  try {
    // Initialize a URL object
    const url = new URL(originalUrl);

    // Ensure both pathname and newPath are properly formatted
    const separator = url.pathname.endsWith("/") ? "" : "/";
    const formattedNewPath = newPath.startsWith("/")
      ? newPath.slice(1)
      : newPath;

    // Append the new path segment
    url.pathname = `${url.pathname}${separator}${formattedNewPath}`;

    // Return the updated URL as a string
    return url.toString();
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
}
