import axios from "axios"

export async function getSound(id: number) {
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

		console.log(result.data)
		return result.data
	} catch (error) {
		console.log("Error!")
		console.log(error)
	}
}
