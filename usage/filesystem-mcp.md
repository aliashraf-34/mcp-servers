# filesystem-mcp

A comprehensive Model Context Protocol (MCP) server for filesystem operations, search, and code inspection.

## Overview

`filesystem-mcp` provides a full set of tools to interact with the local filesystem, including file management, directory traversal, content search, and function extraction from source files.

It supports both basic file operations and advanced features like recursive search and code parsing.

---

## Features

- Full file and directory management (read, write, delete, rename, copy)
- JSON read/write support
- Recursive file search (by name and content)
- Line-level grep functionality
- Function extraction from `.js` and `.sh` files
- Metadata inspection (stat)
- UTF-8 detection to avoid binary file issues

---

## Tool API

### File Operations

#### `read_file`
Read file contents as UTF-8 text.

```json
{
  "filePath": "string"
}
```

---

#### `write_file`
Write or overwrite a file.

```json
{
  "filePath": "string",
  "content": "string"
}
```

---

#### `append_file`
Append text to a file.

```json
{
  "filePath": "string",
  "content": "string"
}
```

---

#### `delete_file`
Delete a file.

```json
{
  "filePath": "string"
}
```

---

#### `copy_file`
Copy a file.

```json
{
  "srcPath": "string",
  "destPath": "string"
}
```

---

#### `rename`
Rename or move a file/directory.

```json
{
  "oldPath": "string",
  "newPath": "string"
}
```

---

### Directory Operations

#### `read_dir`
List directory contents with type info.

```json
{
  "dirPath": "string"
}
```

---

#### `mkdir`
Create a directory recursively.

```json
{
  "dirPath": "string"
}
```

---

#### `delete_dir`
Delete a directory.

```json
{
  "dirPath": "string",
  "recursive": "boolean"
}
```

---

### Metadata & Checks

#### `stat`
Get file or directory metadata.

```json
{
  "filePath": "string"
}
```

Returns:
- size
- type info
- timestamps (created, modified, accessed)

---

#### `exists`
Check if a path exists.

```json
{
  "filePath": "string"
}
```

---

### JSON Operations

#### `read_json`
Read and parse a JSON file.

```json
{
  "filePath": "string"
}
```

---

#### `write_json`
Write an object as formatted JSON.

```json
{
  "filePath": "string",
  "data": {}
}
```

---

### Search & Inspection

#### `find_files`
Recursively search for files by filename or content.

```json
{
  "dirPath": "string",
  "keyword": "string"
}
```

Behavior:
- Matches filename (case-insensitive)
- If not matched, scans UTF-8 readable files for content
- Returns matches with:
  - `filePath`
  - `matchedIn`: `"filename"` or `"content"`
  - `hits` (for content matches)

---

#### `grep`
Search a file for keyword matches (line-level).

```json
{
  "filePath": "string",
  "keyword": "string"
}
```

Returns:
- line number
- matching content

---

#### `find_func`
Extract full function definition from `.js` or `.sh` files.

```json
{
  "filePath": "string",
  "funcName": "string"
}
```

Supported patterns:
- JavaScript:
  - `function foo()`
  - `async function foo()`
  - `const foo = () => {}`
  - `const foo = function() {}`
- Shell:
  - `foo() { }`
  - `function foo { }`

Returns:
- full function source code

---

## Error Handling

- Returns error messages as text
- Handles:
  - invalid paths
  - JSON parse errors
  - unsupported file types for `find_func`
  - missing functions

---

## Notes

- All outputs are returned as formatted JSON strings
- Content search skips binary files using a null-byte heuristic
- Recursive traversal is implemented via async generator (`walk`)
- `grep` is stream-based for efficiency on large files

---

## Security Considerations

- Full read/write/delete access to filesystem
- No sandboxing or path restrictions
- Recursive operations may be expensive on large directories
- Use in controlled environments only