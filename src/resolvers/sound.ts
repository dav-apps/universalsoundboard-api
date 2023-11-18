import * as crypto from "crypto"
import { isSuccessStatusCode, TableObjectsController } from "dav-js"
import { getSound, searchSounds } from "../services/freesoundApiService.js"
import { List, ResolverContext, Sound } from "../types.js"
import {
	throwApiError,
	throwValidationError,
	generateUuidForFreesoundItem,
	randomNumber
} from "../utils.js"
import { storeSoundTableId } from "../constants.js"
import { apiErrors } from "../errors.js"
import { validateNameLength } from "../services/validationService.js"

export async function retrieveSound(
	parent: any,
	args: { id: number }
): Promise<Sound> {
	let sound = await getSound(args.id)

	return {
		id: null,
		uuid: await generateUuidForFreesoundItem(sound.id),
		name: sound.name,
		description: sound.description,
		audioFileUrl: sound.previews["preview-hq-mp3"],
		type: sound.type,
		source: sound.url,
		status: "published"
	}
}

export async function listSounds(
	parent: any,
	args: { query?: string; random?: boolean; limit?: number }
): Promise<List<Sound>> {
	if (args.random) {
		let limit = args.limit ?? 10
		let initialSearchResult = await searchSounds({ pageSize: 1 })
		let totalItems = initialSearchResult.count
		let pages = Math.floor(totalItems / limit)
		let index = randomNumber(1, pages)

		let searchResult = await searchSounds({
			page: index,
			pageSize: limit
		})

		let items: Sound[] = []

		for (let item of searchResult.results) {
			items.push({
				id: BigInt(item.id),
				uuid: await generateUuidForFreesoundItem(item.id),
				name: item.name,
				description: item.description,
				audioFileUrl: item.previews["preview-hq-mp3"],
				type: item.type,
				source: item.url,
				status: "published"
			})
		}

		return {
			total: totalItems,
			items
		}
	} else {
		let searchResult = await searchSounds({
			query: args.query,
			pageSize: args.limit
		})
		if (searchResult == null) return null

		let items: Sound[] = []

		for (let item of searchResult.results) {
			items.push({
				id: BigInt(item.id),
				uuid: await generateUuidForFreesoundItem(item.id),
				name: item.name,
				description: item.description,
				audioFileUrl: item.previews["preview-hq-mp3"],
				type: item.type,
				source: item.url,
				status: "published"
			})
		}

		return {
			total: searchResult.count,
			items
		}
	}
}

export async function createSound(
	parent: any,
	args: { name: string },
	context: ResolverContext
): Promise<Sound> {
	const user = context.user

	// Check if the user is logged in
	if (user == null) {
		throwApiError(apiErrors.notAuthenticated)
	}

	// Validate the args
	throwValidationError(validateNameLength(args.name))

	// Create the sound
	let uuid = crypto.randomUUID()

	let sound = await context.prisma.sound.create({
		data: {
			uuid,
			name: args.name
		}
	})

	// Create the sound table object
	let createSoundResponse = await TableObjectsController.CreateTableObject({
		accessToken: context.accessToken,
		uuid,
		tableId: storeSoundTableId,
		file: true
	})

	if (!isSuccessStatusCode(createSoundResponse.status)) {
		throwApiError(apiErrors.unexpectedError)
	}

	return {
		...sound,
		audioFileUrl: null,
		source: null
	}
}
