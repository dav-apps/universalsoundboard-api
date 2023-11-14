import "dotenv/config"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import { makeExecutableSchema } from "@graphql-tools/schema"
import express from "express"
import http from "http"
import cors from "cors"
import { createClient } from "redis"
import { typeDefs } from "./src/typeDefs.js"
import { resolvers } from "./src/resolvers.js"

const port = process.env.PORT || 4003
const app = express()
const httpServer = http.createServer(app)

//#region Redis config
export const redis = createClient({
	url: process.env.REDIS_URL,
	database: process.env.ENVIRONMENT == "production" ? 7 : 6 // production: 7, staging: 6
})

redis.on("error", err => console.log("Redis Client Error", err))
await redis.connect()
//#endregion

let schema = makeExecutableSchema({
	typeDefs,
	resolvers
})

const server = new ApolloServer({
	schema,
	plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
})

await server.start()

app.use(
	"/",
	cors<cors.CorsRequest>(),
	express.json({ type: "application/json", limit: "50mb" }),
	expressMiddleware(server)
)

await new Promise<void>(resolve => httpServer.listen({ port }, resolve))
console.log(`🚀 Server ready at http://localhost:${port}/`)
