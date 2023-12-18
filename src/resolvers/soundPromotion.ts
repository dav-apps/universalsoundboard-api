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
import { validateCurrency } from "../services/validationService.js"
import { ResolverContext, Currency } from "../types.js"
import { throwApiError, throwValidationError } from "../utils.js"
import { apiErrors } from "../errors.js"

export async function createSoundPromotion(
	parent: any,
	args: { uuid: string; title?: string; currency?: Currency },
	context: ResolverContext
): Promise<SoundPromotion> {
	const user = context.user
	const currency = args.currency ?? "eur"
	const price = 150

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

	// Validate the currency
	throwValidationError(validateCurrency(currency))

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
		price,
		currency
	})

	let createCheckoutSessionResponse =
		await CheckoutSessionsController.CreateCheckoutSession({
			accessToken: context.accessToken,
			mode: "payment",
			currency,
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
			price,
			currency,
			sessionUrl,
			sound: {
				connect: {
					id: sound.id
				}
			}
		}
	})
}
