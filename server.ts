import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import { makeExecutableSchema } from "@graphql-tools/schema"
import express from "express"
import http from "http"
import cors from "cors"
import { PrismaClient } from "@prisma/client"
import { createClient } from "redis"
import {
	Dav,
	User,
	Environment,
	UsersController,
	convertUserResourceToUser
} from "dav-js"
import { throwApiError } from "./src/utils.js"
import { apiErrors } from "./src/errors.js"
import { typeDefs } from "./src/typeDefs.js"
import { resolvers } from "./src/resolvers.js"
import { setup as webhookSetup } from "./src/endpoints/webhooks.js"
import { setup as soundSetup } from "./src/endpoints/sound.js"

const port = process.env.PORT || 4003
const app = express()
const httpServer = http.createServer(app)

export const prisma = new PrismaClient()

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

// Init dav
let environment = Environment.Development

switch (process.env.ENVIRONMENT) {
	case "production":
		environment = Environment.Production
		break
	case "staging":
		environment = Environment.Staging
		break
}

new Dav({
	environment,
	server: true
})

// Call setup functions of each endpoint file
webhookSetup(app)
soundSetup(app)

app.use(
	"/",
	cors<cors.CorsRequest>(),
	express.json({ type: "application/json", limit: "50mb" }),
	expressMiddleware(server, {
		context: async ({ req }) => {
			const accessToken = req.headers.authorization
			let user: User = null

			if (accessToken != null) {
				let userResponse = await UsersController.retrieveUser(
					`
						id
						firstName
						profileImage {
							url
						}
					`,
					{
						accessToken
					}
				)

				if (!Array.isArray(userResponse)) {
					user = convertUserResourceToUser(userResponse)
				} else if (userResponse.includes("SESSION_EXPIRED")) {
					throwApiError(apiErrors.sessionExpired)
				}
			}

			return {
				prisma,
				redis,
				accessToken,
				user
			}
		}
	})
)

await new Promise<void>(resolve => httpServer.listen({ port }, resolve))
console.log(`🚀 Server ready at http://localhost:${port}/`)

BigInt.prototype["toJSON"] = function () {
	return this.toString()
}
