import { Tag } from "@prisma/client"
import { ResolverContext, QueryResult, List } from "../types.js"

export async function listTags(
	parent: any,
	args: { limit?: number; offset?: number },
	context: ResolverContext
): Promise<QueryResult<List<Tag>>> {
	let take = args.limit ?? 10
	if (take <= 0) take = 10

	let skip = args.offset ?? 0
	if (skip < 0) skip = 0

	const [total, items] = await context.prisma.$transaction([
		context.prisma.tag.count(),
		context.prisma.tag.findMany({
			take,
			skip
		})
	])

	return {
		caching: true,
		data: {
			total,
			items
		}
	}
}
