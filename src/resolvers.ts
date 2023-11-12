import * as soundResolvers from "./resolvers/sound.js"

export const resolvers = {
	Query: {
		retrieveSound: soundResolvers.retrieveSound
	}
}
