export const swaggerConfig = {
    swaggerDefinition: {
        openapi: "3.1.0",
        info: {
            title: "Sample API",
            description: "dummy api to test swagger",
            version: "1.0.0"
        },
        servers: [
            { url: "http://localhost:3000" }
        ]
    },
    apis: ['./**/*.ts']
}