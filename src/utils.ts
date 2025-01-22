import { Response } from "express"
import { GraphQLError } from "graphql"
import { User as DavUser } from "dav-js"
import { ApiError, User } from "./types.js"
import { apiErrors } from "./errors.js"

export function throwApiError(error: ApiError) {
	throw new GraphQLError(error.message, {
		extensions: {
			code: error.code,
			http: {
				status: 200
			}
		}
	})
}

export function throwValidationError(...errors: string[]) {
	let filteredErrors = errors.filter(e => e != null)

	if (filteredErrors.length > 0) {
		throw new GraphQLError(apiErrors.validationFailed.message, {
			extensions: {
				code: apiErrors.validationFailed.code,
				errors: filteredErrors
			}
		})
	}
}

export function throwEndpointError(error?: ApiError) {
	if (error == null) return

	throw new Error(error.code)
}

export function handleEndpointError(res: Response, e: Error) {
	// Find the error by error code
	let error = Object.values(apiErrors).find(err => err.code == e.message)

	if (error != null) {
		sendEndpointError(res, error)
	} else {
		sendEndpointError(res, apiErrors.unexpectedError)
	}
}

function sendEndpointError(res: Response, error: ApiError) {
	res.status(error.status || 400).json({
		code: error.code,
		message: error.message
	})
}

export async function generateUuidForFreesoundItem(id: number) {
	return `freesound:${id}`
}

export function getTableObjectFileUrl(uuid: string) {
	return `https://dav-backend-dev.fra1.cdn.digitaloceanspaces.com/${uuid}`
}

export function randomNumber(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getFileExtensionByContentType(contentType: string): string {
	switch (contentType) {
		case "audio/mpeg":
			return "mp3"
		case "audio/m4a":
			return "m4a"
		case "audio/wav":
			return "wav"
		case "audio/ogg":
			return "ogg"
		default:
			return null
	}
}

export function convertDavUserToUser(davUser: DavUser): User {
	return {
		id: davUser.Id,
		firstName: davUser.FirstName,
		profileImage: davUser.ProfileImage
	}
}
