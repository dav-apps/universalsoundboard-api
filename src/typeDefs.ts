export const typeDefs = `#graphql
	type Query {
		retrieveSound(id: Int!): Sound
		listSounds(
			mine: Boolean
			random: Boolean
			query: String
			limit: Int
			offset: Int
		): SoundList
	}

	type Mutation {
		createSound(name: String!): Sound
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
