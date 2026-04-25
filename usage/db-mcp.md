# db-mcp

A minimal Model Context Protocol (MCP) server providing structured database operations with dynamic schema inference.

## Overview

`db-mcp` exposes a set of tools to manage tables and perform CRUD operations on structured data. Tables are created dynamically using sample objects, allowing flexible schema definition without manual setup.

---

## Features

- Dynamic table creation using sample objects
- Full CRUD support for rows
- Simple query operations (`eq`, `contains`)
- Table management (create, list, clear, delete)
- JSON-based input/output
- Lightweight abstraction over internal database helper

---

## Tool API

### Table Management

#### `create_table`
Create a new table by inferring schema from a sample object.

```json
{
  "name": "string",
  "sampleObject": {}
}
```

---

#### `remove_table`
Delete a table and its schema.

```json
{
  "name": "string"
}
```

---

#### `clear_table`
Remove all rows and reset autoincrement.

```json
{
  "name": "string"
}
```

---

#### `get_all_tables`
List all user-created tables.

```json
{}
```

---

### Row Operations

#### `get_all_items`
Get all rows or specific rows by ID.

```json
{
  "tableName": "string",
  "itemIds": [1, 2, 3]
}
```

---

#### `create_item`
Insert a new row.

```json
{
  "tableName": "string",
  "itemObject": {}
}
```

---

#### `update_item`
Update an existing row (must include numeric `id`).

```json
{
  "tableName": "string",
  "itemObject": {
    "id": 1
  }
}
```

---

#### `remove_item`
Delete a row by ID.

```json
{
  "tableName": "string",
  "itemId": 1
}
```

---

### Query Operations

#### `eq`
Return rows where a field equals a value.

```json
{
  "tableName": "string",
  "fieldName": "string",
  "value": {}
}
```

---

#### `contains`
Return rows where a text field contains a keyword (case-insensitive).

```json
{
  "tableName": "string",
  "fieldName": "string",
  "keyword": "string"
}
```

---

## Behavior

- Tables are created dynamically from object structure
- Each row is expected to include an `id` field (auto-managed internally)
- Query operations return matching rows as JSON
- All outputs are returned as formatted JSON strings

---

## Error Handling

- Returns error messages as text
- Handles:
  - invalid table names
  - missing fields
  - invalid update/delete operations
  - unknown tools

---

## Notes

- Database behavior depends on `initDb` and `database` helper implementation
- Schema inference is based entirely on the provided sample object
- `contains` is case-insensitive and intended for text fields
- `get_all_items` returns full table if `itemIds` is not provided

---

## Security Considerations

- No access control or authentication
- No query sanitization layer exposed here
- Schema is user-defined and may be inconsistent if misused
- Intended for controlled environments only