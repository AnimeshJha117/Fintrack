const RefreshBody = {
    required: true,
    content: {
        "application/json": {
            schema: {
                type: "object",
                required: ["RefreshToken"],
                properties: { RefreshToken: { type: "string" } },
            },
        },
    },
};

export const OpenApiSpec = {
    openapi: "3.0.3",
    info: { title: "Expense Tracker API", version: "1.0.0" },
    servers: [{ url: "/api" }],
    components: {
        securitySchemes: {
            bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
        schemas: {
            Error: {
                type: "object",
                properties: { message: { type: "string" } },
            },
            User: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                },
            },
            Expense: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    amount: {
                        type: "integer",
                        description: "Smallest currency unit, e.g. 25050 = 250.50",
                    },
                    category: { type: "string" },
                    description: { type: "string" },
                    date: { type: "string", format: "date-time" },
                },
            },
            ExpenseInput: {
                type: "object",
                required: ["amount", "category"],
                properties: {
                    amount: { type: "integer", minimum: 1 },
                    category: { type: "string", maxLength: 50 },
                    description: { type: "string", maxLength: 200 },
                    date: { type: "string", format: "date-time" },
                },
            },
        },
    },
    paths: {
        "/health": {
            get: {
                tags: ["System"],
                summary: "Health check",
                responses: { "200": { description: "Server is running" } },
            },
        },
        "/auth/register": {
            post: {
                tags: ["Auth"],
                summary: "Create a new user",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["name", "email", "password"],
                                properties: {
                                    name: { type: "string" },
                                    email: { type: "string", format: "email" },
                                    password: { type: "string", minLength: 8, maxLength: 72 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "User created",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/User" } },
                        },
                    },
                    "400": { description: "Validation failed" },
                    "409": { description: "Email already registered" },
                },
            },
        },
        "/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Log in and receive an access token",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: { type: "string", format: "email" },
                                    password: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    "200": { description: "Returns AccessToken, RefreshToken and User" },
                    "401": { description: "Invalid email or password" },
                },
            },
        },
        "/auth/refresh": {
            post: {
                tags: ["Auth"],
                summary: "Exchange a refresh token for a new token pair",
                requestBody: RefreshBody,
                responses: {
                    "200": { description: "Returns a new AccessToken and RefreshToken" },
                    "401": { description: "Missing or invalid refresh token" },
                },
            },
        },
        "/auth/logout": {
            post: {
                tags: ["Auth"],
                summary: "Revoke a refresh token",
                requestBody: RefreshBody,
                responses: { "204": { description: "Logged out" } },
            },
        },
        "/auth/me": {
            get: {
                tags: ["Auth"],
                summary: "Get the logged-in user",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "The current user",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/User" } },
                        },
                    },
                    "401": { description: "Not authenticated" },
                },
            },
        },
        "/expenses": {
            get: {
                tags: ["Expenses"],
                summary: "List your latest 100 expenses",
                parameters: [
                    {
                        name: "month",
                        in: "query",
                        schema: { type: "string", example: "2026-02" },
                        description: "YYYY-MM",
                    },
                    { name: "category", in: "query", schema: { type: "string" } },
                ],
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "Expenses, newest first",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Expense" },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["Expenses"],
                summary: "Create an expense",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ExpenseInput" },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Expense created",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/Expense" } },
                        },
                    },
                    "400": { description: "Validation failed" },
                },
            },
        },
        "/expenses/categories": {
            get: {
                tags: ["Expenses"],
                summary: "List the distinct categories you have used",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "Sorted category names",
                        content: {
                            "application/json": {
                                schema: { type: "array", items: { type: "string" } },
                            },
                        },
                    },
                },
            },
        },
        "/expenses/{id}": {
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } },
            ],
            get: {
                tags: ["Expenses"],
                summary: "Get one expense",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "The expense",
                        content: {
                            "application/json": { schema: { $ref: "#/components/schemas/Expense" } },
                        },
                    },
                    "404": { description: "Expense not found" },
                },
            },
            patch: {
                tags: ["Expenses"],
                summary: "Update an expense",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ExpenseInput" },
                        },
                    },
                },
                responses: {
                    "200": { description: "Updated expense" },
                    "400": { description: "Validation failed" },
                    "404": { description: "Expense not found" },
                },
            },
            delete: {
                tags: ["Expenses"],
                summary: "Delete an expense",
                security: [{ bearerAuth: [] }],
                responses: {
                    "204": { description: "Deleted" },
                    "404": { description: "Expense not found" },
                },
            },
        },
    },
};