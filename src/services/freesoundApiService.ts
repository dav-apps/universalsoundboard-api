import axios from "axios"

export async function getSound(id: number): Promise<{
	id: number
	name: string
	description: string
}> {
	try {
		let result = await axios({
			method: "get",
			url: `https://freesound.org/apiv2/sounds/${id}/`,
			headers: {
				Authorization: `Token ${process.env.FREESOUND_API_KEY}`
			},
			params: {
				fields: "id,name,description"
			}
		})

		return result.data
	} catch (error) {
		console.error(error)
		return null
	}
}

export async function searchSounds(query?: string): Promise<{
	count: number
	results: {
		id: number
		name: string
		description: string
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
				fields: "id,name,description",
				query
			}
		})

		return result.data
	} catch (error) {
		console.log(error)
		return null
	}
}
