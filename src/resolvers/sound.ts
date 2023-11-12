import { getSound } from "../services/freesoundApiService.js"

export async function retrieveSound(parent: any, args: { id: number }) {
	let sound = await getSound(args.id)

	return {
		name: sound.name,
		description: sound.description
	}
}
