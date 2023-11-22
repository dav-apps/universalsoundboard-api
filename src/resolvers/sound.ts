import * as crypto from "crypto"
import { isSuccessStatusCode, TableObjectsController } from "dav-js"
import { getUserById } from "../services/apiService.js"
import { getSound, searchSounds } from "../services/freesoundApiService.js"
import { ResolverContext, QueryResult, List, User, Sound } from "../types.js"
import {
	throwApiError,
	throwValidationError,
	generateUuidForFreesoundItem,
	getTableObjectFileUrl,
	randomNumber
} from "../utils.js"
import { storeSoundTableId } from "../constants.js"
import { apiErrors } from "../errors.js"
import {
	validateDescriptionLength,
	validateNameLength
} from "../services/validationService.js"

export async function retrieveSound(
	parent: any,
	args: { id: number }
): Promise<QueryResult<Sound>> {
	let sound = await getSound(args.id)

	return {
		caching: true,
		data: {
			id: null,
			uuid: await generateUuidForFreesoundItem(sound.id),
			userId: BigInt(0),
			name: sound.name,
			description: sound.description,
			audioFileUrl: sound.previews["preview-hq-mp3"],
			type: sound.type,
			source: sound.url
		}
	}
}

export async function listSounds(
	parent: any,
	args: {
		mine?: boolean
		random?: boolean
		query?: string
		limit?: number
		offset?: number
	},
	context: ResolverContext
): Promise<QueryResult<List<Sound>>> {
	let take = args.limit ?? 10
	if (take <= 0) take = 10

	let skip = args.offset ?? 0
	if (skip < 0) skip = 0

	if (args.mine && context.user != null) {
		let where = { userId: context.user.id }

		const [total, items] = await context.prisma.$transaction([
			context.prisma.sound.count({ where }),
			context.prisma.sound.findMany({ where })
		])

		let soundItems: Sound[] = []

		for (let item of items) {
			soundItems.push({
				...item,
				audioFileUrl:
					item.type != null ? getTableObjectFileUrl(item.uuid) : null,
				source: null
			})
		}

		return {
			caching: false,
			data: {
				total,
				items: soundItems
			}
		}
	} else if (args.random) {
		let initialSearchResult = await searchSounds({ pageSize: 1 })
		let totalItems = initialSearchResult.count
		let pages = Math.floor(totalItems / take)
		let index = randomNumber(1, pages)

		let searchResult = await searchSounds({
			page: index,
			pageSize: take
		})

		let items: Sound[] = []

		for (let item of searchResult.results) {
			items.push({
				id: BigInt(item.id),
				uuid: await generateUuidForFreesoundItem(item.id),
				userId: BigInt(0),
				name: item.name,
				description: item.description,
				audioFileUrl: item.previews["preview-hq-mp3"],
				type: item.type,
				source: item.url
			})
		}

		return {
			caching: true,
			data: {
				total: totalItems,
				items
			}
		}
	} else {
		let searchResult = await searchSounds({
			query: args.query,
			pageSize: take
		})
		if (searchResult == null) return null

		let items: Sound[] = []

		for (let item of searchResult.results) {
			items.push({
				id: BigInt(item.id),
				uuid: await generateUuidForFreesoundItem(item.id),
				userId: BigInt(0),
				name: item.name,
				description: item.description,
				audioFileUrl: item.previews["preview-hq-mp3"],
				type: item.type,
				source: item.url
			})
		}

		return {
			caching: true,
			data: {
				total: searchResult.count,
				items
			}
		}
	}
}

export async function createSound(
	parent: any,
	args: { name: string; description?: string },
	context: ResolverContext
): Promise<Sound> {
	const user = context.user

	// Check if the user is logged in
	if (user == null) {
		throwApiError(apiErrors.notAuthenticated)
	}

	// Validate the args
	throwValidationError(validateNameLength(args.name))

	if (args.description != null) {
		throwValidationError(validateDescriptionLength(args.description))
	}

	// Create the sound
	let uuid = crypto.randomUUID()

	let sound = await context.prisma.sound.create({
		data: {
			uuid,
			userId: user.id,
			name: args.name,
			description: args.description
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

export async function user(
	sound: Sound,
	args: any,
	context: ResolverContext
): Promise<QueryResult<User>> {
	if (sound.userId == BigInt(0)) {
		return {
			caching: true,
			data: null
		}
	}

	// Get the user from the API
	let response = await getUserById(Number(sound.userId))

	if (isSuccessStatusCode(response.status)) {
		return {
			caching: true,
			data: response.data
		}
	}

	return {
		caching: true,
		data: null
	}
}
