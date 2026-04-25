# MCP Servers by Ali

A collection of modular Model Context Protocol (MCP) servers designed to extend LLM capabilities with system-level, web, filesystem, and database operations.

---

## Overview

This repository provides multiple MCP servers, each focused on a specific domain:

- Shell command execution
- Web search and scraping
- Filesystem access and code inspection
- Structured database operations

All servers are designed to be lightweight, composable, and easy to integrate into MCP-compatible environments.

---

## Capabilities

### Shell Server (`shell-mcp`)
- Execute arbitrary shell commands
- Capture stdout, stderr, and errors
- Useful for automation and system interaction

---

### Web Server (`web-mcp`)
- Perform keyword-based web searches
- Scrape and extract readable webpage content
- Enables external data retrieval for LLM workflows

---

### Filesystem Server (`filesystem-mcp`)
- Full file and directory management
- Recursive search (filename + content)
- Grep-like line search
- Function extraction from `.js` and `.sh` files
- Metadata inspection

---

### Database Server (`db-mcp`)
- Dynamic table creation using JSON objects
- Full CRUD operations
- Simple querying (`eq`, `contains`)
- Lightweight structured data storage

---

## Installation

```bash
git clone https://github.com/aliashraf-34/mcp-servers.git
cd mcp-server-by-ali
npm install
```

All MCP servers are now ready to use.

---

## Project Structure

```
.
├── servers/     # All MCP server implementations
├── helpers/     # Shared helper modules (db, web, etc.)
└── usage/       # Example usage for each server (Markdown)
```

---

## Usage

Each server can be run independently and connected via stdio transport.

Detailed usage examples for every server are available in the `/usage` directory.

---

## Design Goals

- Minimal and clean implementations
- Modular architecture (each server is independent)
- Easy integration with MCP clients and LLM agents
- Extendable via helpers

---

## SEO Keywords
Relevant keywords for this project:

- MCP server
- Model Context Protocol
- MCP tools
- LLM tools integration
- AI tool server
- Node.js MCP server
- shell MCP
- filesystem MCP
- web scraping MCP
- database MCP
- AI automation tools
- developer tools for LLM
- local AI tooling
- MCP SDK server

---

## License

MIT