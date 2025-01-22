import { PrismaClient, Sound as SoundModel } from "@prisma/client"
import { RedisClientType } from "redis"
import { User as DavUser } from "dav-js"

export interface ResolverContext {
	prisma: PrismaClient
	redis: RedisClientType
	accessToken?: string
	user?: DavUser
}

export interface QueryResult<T> {
	caching: boolean
	data: T
}

export interface List<T> {
	total: number
	items: T[]
}

export interface ApiError {
	code: string
	message: string
	status?: number
}

export type Currency = "EUR" | "USD"

//#region Platform models
export interface TableObjectPrice {
	tableObjectUuid: string
	price: number
	currency: string
}
//#endregion

//#region UniversalSoundboard models
export interface User {
	id: number
	firstName: string
	profileImage: string
}

export interface Sound extends SoundModel {
	audioFileUrl: string
	type: string
	source: string
	tags: string[]
}
//#endregion
