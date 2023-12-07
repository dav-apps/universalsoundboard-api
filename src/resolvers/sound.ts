import * as crypto from "crypto"
import { PrismaClient, Tag } from "@prisma/client"
import { DateTime } from "luxon"
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
	args: { uuid: string },
	context: ResolverContext
): Promise<QueryResult<Sound>> {
	// Check the source of the sound
	if (args.uuid.startsWith("freesound")) {
		// Get the freesound id from the uuid
		let freesoundId = +args.uuid.split(":")[1]
		let sound = await getSound(freesoundId)

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
				source: sound.url,
				tags: sound.tags,
				createdAt: null,
				updatedAt: null
			}
		}
	} else {
		// Get the sound from the database
		let sound = await context.prisma.sound.findFirst({
			where: { uuid: args.uuid },
			include: { tags: true }
		})

		if (sound == null) {
			return {
				caching: true,
				data: null
			}
		}

		// Get the tags of the sound
		let tags: string[] = []

		for (let tag of sound.tags) {
			tags.push(tag.name)
		}

		return {
			caching:
				context.user == null || sound.userId != BigInt(context.user.id),
			data: {
				...sound,
				audioFileUrl:
					sound.type != null ? getTableObjectFileUrl(sound.uuid) : null,
				source: null,
				tags
			}
		}
	}
}

export async function listSounds(
	parent: any,
	args: {
		mine?: boolean
		userId?: number
		random?: boolean
		latest?: boolean
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

	let mine = args.mine && context.user != null

	if (mine || args.userId) {
		let where = { userId: context.user.id }

		if (args.userId) {
			where.userId = args.userId
		}

		const [total, items] = await context.prisma.$transaction([
			context.prisma.sound.count({ where }),
			context.prisma.sound.findMany({
				where,
				take,
				skip,
				include: { tags: true }
			})
		])

		let soundItems: Sound[] = []

		for (let item of items) {
			let tags: string[] = []

			for (let tag of item.tags) {
				tags.push(tag.name)
			}

			soundItems.push({
				...item,
				audioFileUrl:
					item.type != null ? getTableObjectFileUrl(item.uuid) : null,
				source: null,
				tags
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
			sort: "created_desc",
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
				source: item.url,
				tags: item.tags,
				createdAt: null,
				updatedAt: null
			})
		}

		return {
			caching: true,
			data: {
				total: totalItems,
				items
			}
		}
	} else if (args.latest) {
		let searchResult = await searchSounds({
			sort: "created_desc",
			pageSize: take + 1
		})

		if (searchResult == null) {
			return null
		}

		let items: Sound[] = []

		// Get sounds that are newer than the last freesound item
		let lastItem = searchResult.results.pop()
		let createdDate = DateTime.fromISO(lastItem.created)

		let sounds = await context.prisma.sound.findMany({
			where: { createdAt: { gt: createdDate.toISO() } },
			include: { tags: true },
			take
		})

		for (let sound of sounds) {
			// Get the tags of the sound
			let tags: string[] = []

			for (let tag of sound.tags) {
				tags.push(tag.name)
			}

			items.push({
				...sound,
				audioFileUrl:
					sound.type != null ? getTableObjectFileUrl(sound.uuid) : null,
				source: null,
				tags
			})
		}

		// Get the remaining sounds from the freesound API to fill the array
		let remainingSoundsCount = take - items.length
		let freesoundItems = searchResult.results

		for (let i = 0; i < remainingSoundsCount; i++) {
			// Get a random item from the freesound sounds
			let num = randomNumber(0, freesoundItems.length - 1)
			let item = freesoundItems.splice(num, 1)[0]

			// Insert the item at a random position in the existing sounds
			let num2 = randomNumber(0, items.length - 1)
			if (items.length == 0) num2 = 0

			items.splice(num2, 0, {
				id: BigInt(item.id),
				uuid: await generateUuidForFreesoundItem(item.id),
				userId: BigInt(0),
				name: item.name,
				description: item.description,
				audioFileUrl: item.previews["preview-hq-mp3"],
				type: item.type,
				source: item.url,
				tags: item.tags,
				createdAt: null,
				updatedAt: null
			})
		}

		return {
			caching: true,
			data: {
				total: items.length,
				items
			}
		}
	} else {
		let searchResult = await searchSounds({
			query: args.query,
			page: skip > 0 ? Math.floor(skip / take) + 1 : 1,
			pageSize: take
		})

		if (searchResult == null) {
			return null
		}

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
				source: item.url,
				tags: item.tags,
				createdAt: null,
				updatedAt: null
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
	args: { name: string; description?: string; tags?: string[] },
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

	let tags = await getTags(args.tags, context.prisma)

	// Create the sound
	let uuid = crypto.randomUUID()

	let tagNames: string[] = []
	let tagsData = {
		connect: []
	}

	for (let tag of tags) {
		tagNames.push(tag.name)
		tagsData.connect.push({ id: tag.id })
	}

	let sound = await context.prisma.sound.create({
		data: {
			uuid,
			userId: user.id,
			name: args.name,
			description: args.description,
			tags: tagsData
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
		source: null,
		tags: tagNames
	}
}

export async function updateSound(
	parent: any,
	args: { uuid: string; name?: string; description?: string; tags?: string[] },
	context: ResolverContext
): Promise<Sound> {
	const uuid = args.uuid
	const user = context.user

	if (uuid == null) return null

	// Check if the user is logged in
	if (user == null) {
		throwApiError(apiErrors.notAuthenticated)
	}

	// Get the sound
	let sound = await context.prisma.sound.findFirst({
		where: { uuid: args.uuid },
		include: { tags: true }
	})

	if (sound == null) {
		throwApiError(apiErrors.soundNotExists)
	}

	// Check if the sound belongs to the user
	if (sound.userId != BigInt(user.id)) {
		throwApiError(apiErrors.actionNotAllowed)
	}

	// Validate the args
	let errors: string[] = []

	if (args.name != null) {
		errors.push(validateNameLength(args.name))
	}

	if (args.description != null) {
		errors.push(validateDescriptionLength(args.description))
	}

	throwValidationError(...errors)

	// Update the sound
	let data = {}

	if (args.name != null) {
		data["name"] = args.name
	}

	if (args.description != null) {
		data["description"] = args.description
	}

	// Remove all tag connections
	if (args.tags != null) {
		let disconnect = []

		for (let tag of sound.tags) {
			disconnect.push({
				uuid: tag.uuid
			})
		}

		data["tags"] = { disconnect }
	}

	await context.prisma.sound.update({
		where: { uuid: args.uuid },
		data
	})

	// Create the new tag connections
	let connect = []
	let tags = await getTags(args.tags, context.prisma)

	for (let tag of tags) {
		connect.push({
			uuid: tag.uuid
		})
	}

	let result = await context.prisma.sound.update({
		where: { uuid: args.uuid },
		data: {
			tags: { connect }
		},
		include: { tags: true }
	})

	let tagsResult: string[] = []

	for (let tag of result.tags) {
		tagsResult.push(tag.name)
	}

	return {
		...result,
		audioFileUrl:
			sound.type != null ? getTableObjectFileUrl(sound.uuid) : null,
		source: null,
		tags: tagsResult
	}
}

export async function deleteSound(
	parent: any,
	args: { uuid: string },
	context: ResolverContext
): Promise<Sound> {
	const user = context.user

	// Check if the user is logged in
	if (user == null) {
		throwApiError(apiErrors.notAuthenticated)
	}

	// Get the sound from the database
	let sound = await context.prisma.sound.findFirst({
		where: { uuid: args.uuid },
		include: { tags: true }
	})

	if (sound == null) {
		return null
	}

	// Check if the sound belongs to the user
	if (sound.userId != BigInt(user.id)) {
		throwApiError(apiErrors.actionNotAllowed)
	}

	let tags: string[] = []

	for (let tag of sound.tags) {
		tags.push(tag.name)
	}

	// Delete the sound on the dav backend
	await TableObjectsController.DeleteTableObject({
		accessToken: context.accessToken,
		uuid: args.uuid
	})

	// Delete the sound in the database
	await context.prisma.sound.delete({ where: { uuid: args.uuid } })

	return {
		...sound,
		audioFileUrl: null,
		source: null,
		tags
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

async function getTags(tags: string[], prisma: PrismaClient): Promise<Tag[]> {
	if (tags == null) return []

	let result: Tag[] = []

	for (let tagName of tags) {
		// Check if the tag already exists
		let tag = await prisma.tag.findFirst({
			where: { name: tagName }
		})

		if (tag == null) {
			// Validate the tag
			if (tagName.length < 2 || tagName.length > 20) {
				continue
			}

			// Create the tag
			tag = await prisma.tag.create({
				data: {
					uuid: crypto.randomUUID(),
					name: tagName
				}
			})
		}

		result.push(tag)
	}

	return result
}
