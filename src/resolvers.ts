import { ResolverContext } from "./types.js"
import { cachingResolver } from "./services/cachingService.js"
import * as userResolvers from "./resolvers/user.js"
import * as soundResolvers from "./resolvers/sound.js"
import * as soundPromotionResolvers from "./resolvers/soundPromotion.js"
import * as tagResolvers from "./resolvers/tag.js"

export const resolvers = {
	Query: {
		retrieveUser: (
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
				userResolvers.retrieveUser
			),
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
			cachingResolver(
				parent,
				args,
				context,
				info,
				soundResolvers.listSounds
			),
		listTags: (parent: any, args: any, context: ResolverContext, info: any) =>
			cachingResolver(parent, args, context, info, tagResolvers.listTags)
	},
	Mutation: {
		createSound: soundResolvers.createSound,
		updateSound: soundResolvers.updateSound,
		deleteSound: soundResolvers.deleteSound,
		createSoundPromotion: soundPromotionResolvers.createSoundPromotion
	},
	Sound: {
		user: (parent: any, args: any, context: ResolverContext, info: any) =>
			cachingResolver(parent, args, context, info, soundResolvers.user)
	}
}
