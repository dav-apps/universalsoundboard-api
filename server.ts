import express from "express"
import http from "http"

const port = process.env.PORT || 4002
const app = express()
const httpServer = http.createServer(app)

app.get("/", (req, res) => {
	res.send("Hello World")
})

await new Promise<void>(resolve => httpServer.listen({ port }, resolve))
console.log(`🚀 Server ready at http://localhost:${port}/`)
