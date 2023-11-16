import { Express, Request, Response, raw } from "express"
import cors from "cors"

export async function uploadSoundFile(req: Request, res: Response) {
	res.send("Hello World")
}

export function setup(app: Express) {
	app.post(
		"/sounds",
		raw({ type: "*/*", limit: "50mb" }),
		cors(),
		uploadSoundFile
	)
}
