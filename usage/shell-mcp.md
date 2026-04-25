# shell-mcp

A minimal Model Context Protocol (MCP) server that exposes a single tool to execute shell commands.

## Overview

`shell-mcp` is a lightweight MCP server built with the official SDK. It provides one tool:

- `run` — executes a shell command on the host system and returns the output.

This is useful for integrating system command execution into MCP-compatible clients or LLM workflows.

---

## Features

- Simple and minimal implementation
- Executes arbitrary shell commands
- Returns `stdout`, `stderr`, or error messages

---

## Tool API

### `run`

**Description:** Execute a shell command

**Input:**
```json
{
  "cmd": "string"
}
```

**Example:**
```json
{
  "name": "run",
  "arguments": {
    "cmd": "ls -la"
  }
}
```

**Output:**
- Returns `stdout` if available
- Otherwise returns `stderr`
- Otherwise returns error message
- Fallback: `"no output"`

---

## Example Behavior

| Command        | Output Type |
|----------------|------------|
| `ls`           | stdout     |
| `cat missing`  | stderr     |
| invalid cmd    | error      |

---

## Notes

- Commands are executed using `child_process.exec`
- Timeout is set to **20 seconds**
- No sanitization or sandboxing is applied