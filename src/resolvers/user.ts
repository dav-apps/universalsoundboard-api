import { Auth, UsersController } from "dav-js"
import { convertDavUserToUser } from "../utils.js"
import { ResolverContext, QueryResult, User } from "../types.js"

export async function retrieveUser(
	parent: any,
	args: { id?: number },
	context: ResolverContext
): Promise<QueryResult<User>> {
	// If id == null, return the authenticated user
	if (args.id == null || args.id <= 0) {
		return {
			caching: false,
			data: convertDavUserToUser(context.user)
		}
	}

	// Get the user from the API
	let response = await UsersController.retrieveUserById(
		`
			id
			firstName
			profileImage {
				url
			}
		`,
		{
			auth: new Auth({
				apiKey: process.env.DAV_API_KEY,
				secretKey: process.env.DAV_SECRET_KEY,
				uuid: process.env.DAV_UUID
			}),
			id: args.id
		}
	)

	if (!Array.isArray(response)) {
		return {
			caching: true,
			data: convertDavUserToUser(response)
		}
	}

	return {
		caching: true,
		data: null
	}
}
