import { getSound, searchSounds } from "../services/freesoundApiService.js"
import { List, Sound } from "../types.js"

export async function retrieveSound(
	parent: any,
	args: { id: number }
): Promise<Sound> {
	let sound = await getSound(args.id)

	return {
		name: sound.name,
		description: sound.description,
		audioFileUrl: sound.previews["preview-lq-mp3"],
		source: sound.url
	}
}

export async function listSounds(
	parent: any,
	args: { query?: string }
): Promise<List<Sound>> {
	let searchResult = await searchSounds(args.query)
	if (searchResult == null) return null

	let items: Sound[] = []

	for (let item of searchResult.results) {
		items.push({
			name: item.name,
			description: item.description,
			audioFileUrl: item.previews["preview-lq-mp3"],
			source: item.url
		})
	}

	return {
		total: searchResult.count,
		items
	}
}
