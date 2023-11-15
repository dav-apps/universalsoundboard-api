export const typeDefs = `#graphql
	type Query {
		retrieveSound(id: Int!): Sound
		listSounds(query: String, limit: Int): SoundList
	}

	type Sound {
		name: String
		description: String
		audioFileUrl: String
		type: String
		source: String
	}

	type SoundList {
		total: Int!
		items: [Sound!]!
	}
`
