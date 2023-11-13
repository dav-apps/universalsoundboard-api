export const typeDefs = `#graphql
	type Query {
		retrieveSound(id: Int!): Sound
		listSounds(query: String): SoundList
	}

	type Sound {
		name: String
		description: String
	}

	type SoundList {
		total: Int!
		items: [Sound!]!
	}
`
