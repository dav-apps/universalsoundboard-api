import { isSuccessStatusCode } from "dav-js"
import { getUserById } from "../services/apiService.js"
import { ResolverContext, QueryResult, User } from "../types.js"

export async function retrieveUser(
	parent: any,
	args: { id: number },
	context: ResolverContext
): Promise<QueryResult<User>> {
	if (args.id <= 0) {
		return {
			caching: true,
			data: null
		}
	}

	// Get the user from the API
	let response = await getUserById(args.id)

	if (isSuccessStatusCode(response.status)) {
		return {
			caching: true,
			data: response.data
		}
	}

	return {
		caching: true,
		data: null
	}
}
