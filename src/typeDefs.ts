export const typeDefs = `#graphql
	type Query {
		retrieveSound(id: Int!): Sound
	}
	type Sound {
		name: String
		description: String
	}
`
