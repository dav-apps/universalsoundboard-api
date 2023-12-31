export const typeDefs = `#graphql
	type Query {
		retrieveUser(id: Int): User
		retrieveSound(uuid: String!): Sound
		listSounds(
			mine: Boolean
			userId: Int
			random: Boolean
			latest: Boolean
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
		updateSound(
			uuid: String!
			name: String
			description: String
			tags: [String!]
		): Sound
		deleteSound(uuid: String!): Sound
		createSoundPromotion(
			uuid: String!
			title: String
			currency: String
		): SoundPromotion
		createSoundReport(
			uuid: String!
			description: String!
		): SoundReport
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
		channels: Int
		sampleRate: Int
		duration: Float
		source: String
		promotion: SoundPromotion
		tags: [String!]!
	}

	type SoundList {
		total: Int!
		items: [Sound!]!
	}

	type SoundPromotion {
		uuid: String!
		sound: Sound!
		startDate: String!
		endDate: String!
		price: Int!
		currency: String!
		sessionUrl: String!
		paid: Boolean!
	}

	type SoundReport {
		uuid: String!
		user: User
		sound: Sound!
		description: String!
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
