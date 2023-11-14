import { RedisClientType } from "redis"

export interface ResolverContext {
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
}
