import axios from "axios"

export async function getSound(id: number): Promise<{
	id: number
	url: string
	name: string
	description: string
	type: string
	previews: {
		"preview-hq-mp3": string
	}
}> {
	try {
		let result = await axios({
			method: "get",
			url: `https://freesound.org/apiv2/sounds/${id}/`,
			headers: {
				Authorization: `Token ${process.env.FREESOUND_API_KEY}`
			},
			params: {
				fields: "id,url,name,description,type,previews"
			}
		})

		return result.data
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function searchSounds(params?: {
	query?: string
	limit?: number
}): Promise<{
	count: number
	results: {
		id: number
		url: string
		name: string
		description: string
		type: string
		previews: {
			"preview-hq-mp3": string
		}
	}[]
}> {
	try {
		let result = await axios({
			method: "get",
			url: `https://freesound.org/apiv2/search/text`,
			headers: {
				Authorization: `Token ${process.env.FREESOUND_API_KEY}`
			},
			params: {
				fields: "id,url,name,description,type,previews",
				query: params.query,
				sort: "created_desc",
				page_size: params.limit ?? 10
			}
		})

		return result.data
	} catch (error) {
		console.log(error)
		return null
	}
}
