import axios from "axios"
import { UserApiResponse, TableObjectPrice } from "../types.js"
import {
	apiBaseUrlDevelopment,
	apiBaseUrlStaging,
	apiBaseUrlProduction
} from "../constants.js"

function getApiBaseUrl() {
	switch (process.env.ENVIRONMENT) {
		case "staging":
			return apiBaseUrlStaging
		case "production":
			return apiBaseUrlProduction
		default:
			return apiBaseUrlDevelopment
	}
}

export async function getUser(accessToken: string): Promise<UserApiResponse> {
	if (accessToken == null) {
		return null
	}

	try {
		let response = await axios({
			method: "get",
			url: `${getApiBaseUrl()}/v1/user`,
			headers: {
				Authorization: accessToken
			}
		})

		return {
			status: response.status,
			data: {
				id: response.data.id,
				email: response.data.email,
				firstName: response.data.first_name,
				confirmed: response.data.confirmed,
				totalStorage: response.data.total_storage,
				usedStorage: response.data.used_storage,
				plan: response.data.plan,
				dev: response.data.dev,
				provider: response.data.provider,
				profileImage: response.data.profile_image,
				profileImageEtag: response.data.profile_image_etag
			}
		}
	} catch (error) {
		return {
			status: error.response?.status || 500,
			errors: error.response?.data?.errors
		}
	}
}

export async function getUserById(id: number): Promise<UserApiResponse> {
	try {
		let response = await axios({
			method: "get",
			url: `${getApiBaseUrl()}/v1/user/${id}`,
			headers: {
				Authorization: process.env.DAV_AUTH
			}
		})

		return {
			status: response.status,
			data: {
				id: response.data.id,
				email: response.data.email,
				firstName: response.data.first_name,
				confirmed: response.data.confirmed,
				totalStorage: response.data.total_storage,
				usedStorage: response.data.used_storage,
				plan: response.data.plan,
				dev: response.data.dev,
				provider: response.data.provider,
				profileImage: response.data.profile_image,
				profileImageEtag: response.data.profile_image_etag
			}
		}
	} catch (error) {
		return {
			status: error.response?.status || 500,
			errors: error.response?.data?.errors
		}
	}
}

export async function setTableObjectPrice(params: {
	uuid: string
	price: number
	currency: string
}): Promise<TableObjectPrice> {
	try {
		let response = await axios({
			method: "put",
			url: `${getApiBaseUrl()}/v2/table_objects/${params.uuid}/price`,
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
