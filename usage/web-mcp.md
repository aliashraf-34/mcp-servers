# web-mcp

A minimal Model Context Protocol (MCP) server that provides web search and scraping capabilities.

## Overview

`web-mcp` exposes two tools for retrieving and processing web data:

- `search` — performs keyword-based search using DuckDuckGo
- `scrape` — extracts readable content from a webpage

Designed for integration with MCP-compatible clients or LLM workflows that require external web data.

---

## Features

- Keyword-based web search
- Webpage content extraction
- JSON-formatted search results
- Clean text output from scraped pages

---

## Tool API

### `search`

**Description:** Perform a search using DuckDuckGo with an array of keywords

**Input:**
```json
{
  "keywords": ["string"]
}
```

**Example:**
```json
{
  "name": "search",
  "arguments": {
    "keywords": ["nodejs", "mcp", "sdk"]
  }
}
```

**Output:**
- JSON string containing search results
- Structure depends on `searchKeywords` implementation

---

### `scrape`

**Description:** Scrape a webpage and return readable content

**Input:**
```json
{
  "url": "string"
}
```

**Example:**
```json
{
  "name": "scrape",
  "arguments": {
    "url": "https://example.com"
  }
}
```

**Output:**
- Extracted text content from the webpage

---

## Error Handling

- Returns error message if:
  - Tool name is invalid
  - Search or scrape fails
- Fallback response: `"error"` or specific error message

---

## Notes

- Search results are returned as formatted JSON strings
- Scraped content is returned as plain text
- Behavior depends on `searchKeywords` and `scrape` helper implementations

---

## Security Considerations

- Scraping arbitrary URLs may expose the system to untrusted content
- Ensure proper validation and sandboxing if used in production environments