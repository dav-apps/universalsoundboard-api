import { getSound, searchSounds } from "../services/freesoundApiService.js"
import { List, Sound } from "../types.js"
import { randomNumber } from "../utils.js"

export async function retrieveSound(
	parent: any,
	args: { id: number }
): Promise<Sound> {
	let sound = await getSound(args.id)

	return {
		name: sound.name,
		description: sound.description,
		audioFileUrl: sound.previews["preview-hq-mp3"],
		type: sound.type,
		source: sound.url
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
				name: item.name,
				description: item.description,
				audioFileUrl: item.previews["preview-hq-mp3"],
				type: item.type,
				source: item.url
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
				name: item.name,
				description: item.description,
				audioFileUrl: item.previews["preview-hq-mp3"],
				type: item.type,
				source: item.url
			})
		}

		return {
			total: searchResult.count,
			items
		}
	}
}
