import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    ListToolsRequestSchema,
    CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import { searchKeywords, scrape } from "../helpers/web-helper.js";

const server = new Server(
    {
        name: "web-mcp",
        version: "1.0.0"
    },
    {
        capabilities: {
            tools: {}
        }
    }
);

// list tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "search",
                description: "Search using DuckDuckGo (keywords array)",
                inputSchema: {
                    type: "object",
                    properties: {
                        keywords: {
                            type: "array",
                            items: { type: "string" }
                        }
                    },
                    required: ["keywords"]
                }
            },
            {
                name: "scrape",
                description: "Scrape webpage and extract readable content",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: { type: "string" }
                    },
                    required: ["url"]
                }
            }
        ]
    };
});

// call tool
server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;

    try {
        if (name === "search") {
            const results = await searchKeywords(args.keywords);

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(results, null, 2)
                    }
                ]
            };
        }

        if (name === "scrape") {
            const content = await scrape(args.url);

            return {
                content: [
                    {
                        type: "text",
                        text: content
                    }
                ]
            };
        }

        throw new Error("Unknown tool");
    } catch (err) {
        return {
            content: [
                {
                    type: "text",
                    text: err.message || "error"
                }
            ]
        };
    }
});

const transport = new StdioServerTransport();
await server.connect(transport);