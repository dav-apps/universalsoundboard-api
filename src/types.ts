import { PrismaClient, Sound as SoundModel } from "@prisma/client"
import { RedisClientType } from "redis"

export interface ResolverContext {
	prisma: PrismaClient
	redis: RedisClientType
	accessToken?: string
	user?: User
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

export interface UserApiResponse {
	status: number
	data?: User
	errors?: { code: number; message: string }[]
}

//#region Platform models
export interface User {
	id: number
	email: string
	firstName: string
	confirmed: boolean
	totalStorage: number
	usedStorage: number
	plan: number
	dev: boolean
	provider: boolean
	profileImage: string
	profileImageEtag: string
}
//#endregion

//#region UniversalSoundboard models
export interface Sound extends SoundModel {
	audioFileUrl: string
	type: string
	source: string
	tags: string[]
}
//#endregion
