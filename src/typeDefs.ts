export const typeDefs = `#graphql
	type Query {
		retrieveUser(id: Int!): User
		retrieveSound(uuid: String!): Sound
		listSounds(
			mine: Boolean
			userId: Int
			random: Boolean
			query: String
			limit: Int
			offset: Int
		): SoundList!
		listTags(limit: Int, offset: Int): TagList!
	}

	type Mutation {
		createSound(
			name: String!
			description: String
			tags: [String!]
		): Sound
		deleteSound(uuid: String!): Sound
	}

	type User {
		id: Int!
		firstName: String!
		profileImage: String!
	}

	type Sound {
		uuid: String!
		user: User
		name: String!
		description: String
		audioFileUrl: String
		type: String
		source: String
		tags: [String!]!
	}

	type SoundList {
		total: Int!
		items: [Sound!]!
	}

	type Tag {
		uuid: String!
		name: String!
	}

	type TagList {
		total: Int!
		items: [Tag!]!
	}
`
