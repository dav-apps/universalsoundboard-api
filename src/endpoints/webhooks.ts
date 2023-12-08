import { Express, Request, Response, json } from "express"
import cors from "cors"
import { handleEndpointError, throwEndpointError } from "../utils.js"
import { apiErrors } from "../errors.js"
import { validateJsonContentType } from "../services/validationService.js"
import { prisma } from "../../server.js"

export async function hook(req: Request, res: Response) {
	try {
		// Check the webhook key
		if (process.env.WEBHOOK_KEY != req.headers.authorization) {
			throwEndpointError(apiErrors.actionNotAllowed)
		}

		// Check if content type is supported
		const contentType = req.headers["content-type"]
		throwEndpointError(validateJsonContentType(contentType))

		// Check the body
		if (
			req.body.uuid != null &&
			req.body.type == "payment_intent_succeeded"
		) {
			// Update the SoundPromotion with the uuid
			await prisma.soundPromotion.update({
				where: { uuid: req.body.uuid, paid: false },
				data: { paid: true }
			})
		}

		res.status(200).json()
	} catch (error) {
		handleEndpointError(res, error)
	}
}

export function setup(app: Express) {
	app.put(
		"/hooks",
		json({ type: "application/json", limit: "50mb" }),
		cors(),
		hook
	)
}
