import axios from "axios"
import { TableObjectPrice } from "../types.js"

export async function setTableObjectPrice(params: {
	uuid: string
	price: number
	currency: string
}): Promise<TableObjectPrice> {
	try {
		let response = await axios({
			method: "put",
			url: `bla/v2/table_objects/${params.uuid}/price`,
			headers: {
				Authorization: process.env.DAV_AUTH,
				"Content-Type": "application/json"
			},
			data: {
				price: params.price,
				currency: params.currency
			}
		})

		return {
			tableObjectUuid: response.data.table_object_uuid,
			price: response.data.price,
			currency: response.data.currency
		}
	} catch (error) {
		console.error(error.response?.data || error)
		return null
	}
}
