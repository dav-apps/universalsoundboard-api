import { Express, Request, Response, raw } from "express"
import cors from "cors"
import * as mm from "music-metadata"
import { UsersController, TableObjectsController, UserResource } from "dav-js"
import {
	handleEndpointError,
	throwEndpointError,
	getFileExtensionByContentType
} from "../utils.js"
import { apiErrors } from "../errors.js"
import { validateAudioContentType } from "../services/validationService.js"
import { prisma } from "../../server.js"

export async function uploadSoundFile(req: Request, res: Response) {
	try {
		const uuid = req.params.uuid
		const accessToken = req.headers.authorization
		const retrieveUserResponse = await UsersController.retrieveUser(
			`
				id
				firstName
				profileImage {
					url
				}
			`,
			{ accessToken }
		)

		if (
			Array.isArray(retrieveUserResponse) &&
			retrieveUserResponse.includes("SESSION_EXPIRED")
		) {
			throwEndpointError(apiErrors.sessionExpired)
		} else if (retrieveUserResponse == null) {
			throwEndpointError(apiErrors.notAuthenticated)
		}

		const user = retrieveUserResponse as UserResource

		// Check if content type is supported
		const contentType = req.headers["content-type"]
		throwEndpointError(validateAudioContentType(contentType))

		// Get the sound
		let sound = await prisma.sound.findFirst({ where: { uuid } })

		if (sound == null) {
			throwEndpointError(apiErrors.soundNotExists)
		}

		// Check if the sound belongs to the user
		if (sound.userId != BigInt(user.id)) {
			throwEndpointError(apiErrors.actionNotAllowed)
		}

		// Upload the file
		let uploadTableObjectFileResponse =
			await TableObjectsController.uploadTableObjectFile({
				accessToken,
				uuid: sound.uuid,
				contentType,
				data: req.body
			})

		if (Array.isArray(uploadTableObjectFileResponse)) {
			throwEndpointError(apiErrors.unexpectedError)
		}

		// Try to get the audio metadata
		let channels = null
		let sampleRate = null
		let duration = null

		try {
			const metadata = await mm.parseBuffer(req.body, {
				mimeType: contentType
			})

			channels = metadata.format.numberOfChannels
			sampleRate = metadata.format.sampleRate
			duration = metadata.format.duration
		} catch (error) {
			console.log(error)
		}

		// Update the sound with the type
		await prisma.sound.update({
			where: { id: sound.id },
			data: {
				type: getFileExtensionByContentType(contentType),
				channels,
				sampleRate,
				duration
			}
		})

		res.status(200).json({ uuid: sound.uuid })
	} catch (error) {
		handleEndpointError(res, error)
	}
}

export function setup(app: Express) {
	app.put(
		"/sounds/:uuid",
		raw({ type: "*/*", limit: "50mb" }),
		cors(),
		uploadSoundFile
	)
}
