import { PrismaClient } from "@prisma/client"
import { RedisClientType } from "redis"

export interface ResolverContext {
	prisma: PrismaClient
	redis: RedisClientType
}

export interface List<T> {
	total: number
	items: T[]
}

export interface Sound {
	name: string
	description: string
	audioFileUrl: string
	type: string
	source: string
}
