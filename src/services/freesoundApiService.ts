import axios from "axios"

export async function getSound(id: number): Promise<{
	id: number
	url: string
	name: string
	tags: string[]
	description: string
	type: string
	channels: number
	duration: number
	samplerate: number
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
				fields:
					"id,url,name,tags,description,type,channels,duration,samplerate,previews"
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
	sort?: string
	page?: number
	pageSize?: number
}): Promise<{
	count: number
	results: {
		id: number
		url: string
		name: string
		tags: string[]
		description: string
		created: string
		type: string
		channels: number
		duration: number
		samplerate: number
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
				fields:
					"id,url,name,tags,description,created,type,channels,duration,samplerate,previews",
				query: params.query,
				sort: params.sort,
				page: params.page ?? 1,
				page_size: params.pageSize ?? 10
			}
		})

		return result.data
	} catch (error) {
		console.log(error)
		return null
	}
}
