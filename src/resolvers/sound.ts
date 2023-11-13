import { getSound, searchSounds } from "../services/freesoundApiService.js"
import { List, Sound } from "../types.js"

export async function retrieveSound(
	parent: any,
	args: { id: number }
): Promise<Sound> {
	let sound = await getSound(args.id)

	return {
		name: sound.name,
		description: sound.description
	}
}

export async function listSounds(
	parent: any,
	args: { query?: string }
): Promise<List<Sound>> {
	let searchResult = await searchSounds(args.query)
	if (searchResult == null) return null

	return {
		total: searchResult.count,
		items: searchResult.results
	}
}
