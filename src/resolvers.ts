import { ResolverContext } from "./types.js"
import { cachingResolver } from "./services/cachingService.js"
import * as soundResolvers from "./resolvers/sound.js"

export const resolvers = {
	Query: {
		retrieveSound: (
			parent: any,
			args: any,
			context: ResolverContext,
			info: any
		) =>
			cachingResolver(
				parent,
				args,
				context,
				info,
				soundResolvers.retrieveSound
			),
		listSounds: (
			parent: any,
			args: any,
			context: ResolverContext,
			info: any
		) =>
			cachingResolver(parent, args, context, info, soundResolvers.listSounds)
	},
	Mutation: {
		createSound: soundResolvers.createSound
	},
	Sound: {
		user: (parent: any, args: any, context: ResolverContext, info: any) =>
			cachingResolver(parent, args, context, info, soundResolvers.user)
	}
}
