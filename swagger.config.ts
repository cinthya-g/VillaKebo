export const swaggerConfig = {
    swaggerDefinition: {
        openapi: "3.1.0",
        info: {
            title: "VillaKebo API",
            description: "Villakebo documentation",
            version: "1.0.0"
        },
        servers: [
            { url: "http://localhost:3000" }
        ]
    },
    apis: ['./**/*.ts']
}