import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    ListToolsRequestSchema,
    CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { createReadStream } from "fs";
import readline from "readline";

// --- Helpers ---

async function* walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) yield* walk(full);
        else yield full;
    }
}

async function isUtf8Readable(filePath) {
    try {
        const buf = Buffer.alloc(512);
        const fd = fsSync.openSync(filePath, "r");
        const bytesRead = fsSync.readSync(fd, buf, 0, 512, 0);
        fsSync.closeSync(fd);
        const slice = buf.slice(0, bytesRead);
        // Null bytes = binary
        if (slice.includes(0x00)) return false;
        slice.toString("utf8");
        return true;
    } catch {
        return false;
    }
}

async function grepFile(filePath, keyword) {
    return new Promise((resolve) => {
        const matches = [];
        const rl = readline.createInterface({ input: createReadStream(filePath) });
        let lineNum = 0;
        rl.on("line", (line) => {
            lineNum++;
            if (line.toLowerCase().includes(keyword.toLowerCase())) {
                matches.push({ line: lineNum, content: line });
            }
        });
        rl.on("close", () => resolve(matches));
        rl.on("error", () => resolve([]));
    });
}

// Extracts a named function from JS or SH source
function extractFunction(source, funcName, ext) {
    if (ext === ".js" || ext === ".mjs" || ext === ".cjs") {
        // Handles: function foo(), const foo = () =>, const foo = function(), async function foo()
        const patterns = [
            new RegExp(`((?:export\\s+)?(?:async\\s+)?function\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{)`),
            new RegExp(`((?:export\\s+)?(?:const|let|var)\\s+${funcName}\\s*=\\s*(?:async\\s+)?(?:\\([^)]*\\)|[^=]+)\\s*=>\\s*\\{)`),
            new RegExp(`((?:export\\s+)?(?:const|let|var)\\s+${funcName}\\s*=\\s*(?:async\\s+)?function\\s*\\([^)]*\\)\\s*\\{)`),
        ];

        for (const pattern of patterns) {
            const match = pattern.exec(source);
            if (!match) continue;

            const start = match.index;
            let depth = 0;
            let i = source.indexOf("{", start);
            if (i === -1) continue;

            for (; i < source.length; i++) {
                if (source[i] === "{") depth++;
                else if (source[i] === "}") {
                    depth--;
                    if (depth === 0) return source.slice(start, i + 1);
                }
            }
        }
        return null;
    }

    if (ext === ".sh") {
        // Handles: foo() { and function foo {
        const patterns = [
            new RegExp(`(${funcName}\\s*\\(\\s*\\)\\s*\\{)`),
            new RegExp(`(function\\s+${funcName}\\s*\\{)`),
        ];

        for (const pattern of patterns) {
            const match = pattern.exec(source);
            if (!match) continue;

            const start = match.index;
            let depth = 0;
            let i = source.indexOf("{", start);
            if (i === -1) continue;

            for (; i < source.length; i++) {
                if (source[i] === "{") depth++;
                else if (source[i] === "}") {
                    depth--;
                    if (depth === 0) return source.slice(start, i + 1);
                }
            }
        }
        return null;
    }

    return null;
}

// --- Server ---

const server = new Server(
    { name: "fs-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "read_file",
                description: "Read file contents as text",
                inputSchema: {
                    type: "object",
                    properties: { filePath: { type: "string" } },
                    required: ["filePath"]
                }
            },
            {
                name: "read_dir",
                description: "List directory contents with type info",
                inputSchema: {
                    type: "object",
                    properties: { dirPath: { type: "string" } },
                    required: ["dirPath"]
                }
            },
            {
                name: "stat",
                description: "Get file/dir metadata",
                inputSchema: {
                    type: "object",
                    properties: { filePath: { type: "string" } },
                    required: ["filePath"]
                }
            },
            {
                name: "exists",
                description: "Check if a path exists",
                inputSchema: {
                    type: "object",
                    properties: { filePath: { type: "string" } },
                    required: ["filePath"]
                }
            },
            {
                name: "read_json",
                description: "Read and parse a JSON file",
                inputSchema: {
                    type: "object",
                    properties: { filePath: { type: "string" } },
                    required: ["filePath"]
                }
            },
            {
                name: "write_file",
                description: "Write/overwrite a file with text content",
                inputSchema: {
                    type: "object",
                    properties: {
                        filePath: { type: "string" },
                        content: { type: "string" }
                    },
                    required: ["filePath", "content"]
                }
            },
            {
                name: "append_file",
                description: "Append text to a file",
                inputSchema: {
                    type: "object",
                    properties: {
                        filePath: { type: "string" },
                        content: { type: "string" }
                    },
                    required: ["filePath", "content"]
                }
            },
            {
                name: "write_json",
                description: "Write an object to a file as formatted JSON",
                inputSchema: {
                    type: "object",
                    properties: {
                        filePath: { type: "string" },
                        data: { type: "object" }
                    },
                    required: ["filePath", "data"]
                }
            },
            {
                name: "mkdir",
                description: "Create a directory recursively",
                inputSchema: {
                    type: "object",
                    properties: { dirPath: { type: "string" } },
                    required: ["dirPath"]
                }
            },
            {
                name: "delete_file",
                description: "Delete a file",
                inputSchema: {
                    type: "object",
                    properties: { filePath: { type: "string" } },
                    required: ["filePath"]
                }
            },
            {
                name: "delete_dir",
                description: "Delete a directory, optionally recursive",
                inputSchema: {
                    type: "object",
                    properties: {
                        dirPath: { type: "string" },
                        recursive: { type: "boolean" }
                    },
                    required: ["dirPath"]
                }
            },
            {
                name: "rename",
                description: "Rename or move a file/directory",
                inputSchema: {
                    type: "object",
                    properties: {
                        oldPath: { type: "string" },
                        newPath: { type: "string" }
                    },
                    required: ["oldPath", "newPath"]
                }
            },
            {
                name: "copy_file",
                description: "Copy a file to a new path",
                inputSchema: {
                    type: "object",
                    properties: {
                        srcPath: { type: "string" },
                        destPath: { type: "string" }
                    },
                    required: ["srcPath", "destPath"]
                }
            },
            {
                name: "find_files",
                description: "Recursively search a directory. Matches keyword against filename (any extension like .mp3) or file contents (UTF-8 files only)",
                inputSchema: {
                    type: "object",
                    properties: {
                        dirPath: { type: "string" },
                        keyword: { type: "string" }
                    },
                    required: ["dirPath", "keyword"]
                }
            },
            {
                name: "grep",
                description: "Search a single file for lines matching a keyword, returns line numbers and content",
                inputSchema: {
                    type: "object",
                    properties: {
                        filePath: { type: "string" },
                        keyword: { type: "string" }
                    },
                    required: ["filePath", "keyword"]
                }
            },
            {
                name: "find_func",
                description: "Extract full function code by name from a .js or .sh file",
                inputSchema: {
                    type: "object",
                    properties: {
                        filePath: { type: "string" },
                        funcName: { type: "string" }
                    },
                    required: ["filePath", "funcName"]
                }
            }
        ]
    };
});

server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;

    try {
        let result;

        switch (name) {
            case "read_file":
                result = await fs.readFile(args.filePath, "utf8");
                break;

            case "read_dir": {
                const entries = await fs.readdir(args.dirPath, { withFileTypes: true });
                result = entries.map(e => ({
                    name: e.name,
                    type: e.isDirectory() ? "dir" : e.isSymbolicLink() ? "symlink" : "file"
                }));
                break;
            }

            case "stat": {
                const s = await fs.stat(args.filePath);
                result = {
                    size: s.size,
                    isFile: s.isFile(),
                    isDirectory: s.isDirectory(),
                    created: s.birthtime,
                    modified: s.mtime,
                    accessed: s.atime
                };
                break;
            }

            case "exists":
                try {
                    await fs.access(args.filePath);
                    result = { exists: true };
                } catch {
                    result = { exists: false };
                }
                break;

            case "read_json": {
                const raw = await fs.readFile(args.filePath, "utf8");
                result = JSON.parse(raw);
                break;
            }

            case "write_file":
                await fs.writeFile(args.filePath, args.content, "utf8");
                result = { success: true };
                break;

            case "append_file":
                await fs.appendFile(args.filePath, args.content, "utf8");
                result = { success: true };
                break;

            case "write_json":
                await fs.writeFile(args.filePath, JSON.stringify(args.data, null, 2), "utf8");
                result = { success: true };
                break;

            case "mkdir":
                await fs.mkdir(args.dirPath, { recursive: true });
                result = { success: true };
                break;

            case "delete_file":
                await fs.unlink(args.filePath);
                result = { success: true };
                break;

            case "delete_dir":
                await fs.rm(args.dirPath, { recursive: args.recursive ?? false, force: true });
                result = { success: true };
                break;

            case "rename":
                await fs.rename(args.oldPath, args.newPath);
                result = { success: true };
                break;

            case "copy_file":
                await fs.copyFile(args.srcPath, args.destPath);
                result = { success: true };
                break;

            case "find_files": {
                const keyword = args.keyword.toLowerCase();
                const matches = [];
                for await (const filePath of walk(args.dirPath)) {
                    const filename = path.basename(filePath).toLowerCase();
                    if (filename.includes(keyword)) {
                        matches.push({ filePath, matchedIn: "filename" });
                        continue;
                    }
                    if (await isUtf8Readable(filePath)) {
                        const lines = await grepFile(filePath, keyword);
                        if (lines.length > 0) {
                            matches.push({ filePath, matchedIn: "content", hits: lines });
                        }
                    }
                }
                result = matches;
                break;
            }

            case "grep": {
                result = await grepFile(args.filePath, args.keyword);
                break;
            }

            case "find_func": {
                const ext = path.extname(args.filePath).toLowerCase();
                if (![".js", ".mjs", ".cjs", ".sh"].includes(ext)) {
                    throw new Error("find_func only supports .js and .sh files");
                }
                const source = await fs.readFile(args.filePath, "utf8");
                const extracted = extractFunction(source, args.funcName, ext);
                if (!extracted) throw new Error(`Function "${args.funcName}" not found in ${args.filePath}`);
                result = { function: extracted };
                break;
            }

            default:
                throw new Error(`Unknown tool: ${name}`);
        }

        return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };

    } catch (err) {
        return {
            content: [{ type: "text", text: `Error: ${err.message}` }]
        };
    }
});

const transport = new StdioServerTransport();
await server.connect(transport);