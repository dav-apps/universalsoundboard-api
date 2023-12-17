import * as crypto from "crypto"
import { DateTime } from "luxon"
import { SoundPromotion } from "@prisma/client"
import {
	CheckoutSessionsController,
	TableObjectsController,
	isSuccessStatusCode,
	ApiResponse,
	CreateCheckoutSessionResponseData
} from "dav-js"
import { setTableObjectPrice } from "../services/apiService.js"
import { ResolverContext } from "../types.js"
import { throwApiError } from "../utils.js"
import { apiErrors } from "../errors.js"

export async function createSoundPromotion(
	parent: any,
	args: { uuid: string; title?: string },
	context: ResolverContext
): Promise<SoundPromotion> {
	const user = context.user

	// Check if the user is logged in
	if (user == null) {
		throwApiError(apiErrors.notAuthenticated)
	}

	// Find the sound
	let sound = await context.prisma.sound.findFirst({
		where: { uuid: args.uuid }
	})

	if (sound == null) {
		throwApiError(apiErrors.soundNotExists)
	}

	// Create the SoundPromotion table object
	let uuid = crypto.randomUUID()

	let createTableObjectResponse =
		await TableObjectsController.CreateTableObject({
			accessToken: context.accessToken,
			uuid,
			tableId: 40
		})

	if (!isSuccessStatusCode(createTableObjectResponse.status)) {
		throwApiError(apiErrors.unexpectedError)
	}

	// Set the price of the table object
	await setTableObjectPrice({
		uuid,
		price: 150,
		currency: "eur"
	})

	let createCheckoutSessionResponse =
		await CheckoutSessionsController.CreateCheckoutSession({
			accessToken: context.accessToken,
			mode: "payment",
			currency: "eur",
			tableObjects: [uuid],
			successUrl:
				"https://universalsoundboard.dav-apps.tech/sound-promotion?success=true",
			cancelUrl: "https://universalsoundboard.dav-apps.tech/sound-promotion",
			productName: args.title ?? "Sound promotion",
			productImage:
				"https://dav-backend.fra1.cdn.digitaloceanspaces.com/misc/sound-promotion.jpg"
		})

	if (!isSuccessStatusCode(createCheckoutSessionResponse.status)) {
		throwApiError(apiErrors.unexpectedError)
	}

	let createCheckoutSessionResponseData = (
		createCheckoutSessionResponse as ApiResponse<CreateCheckoutSessionResponseData>
	).data

	let sessionUrl = createCheckoutSessionResponseData.sessionUrl

	// Create the SoundPromotion
	let now = DateTime.now()

	return await context.prisma.soundPromotion.create({
		data: {
			uuid,
			startDate: now.toJSDate(),
			endDate: now.plus({ days: 3 }).toJSDate(),
			price: 150,
			currency: "eur",
			sessionUrl,
			sound: {
				connect: {
					id: sound.id
				}
			}
		}
	})
}
