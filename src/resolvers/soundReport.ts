import * as crypto from "crypto"
import { SoundReport } from "@prisma/client"
import { validateDescriptionLength } from "../services/validationService.js"
import { ResolverContext } from "../types.js"
import { throwValidationError, throwApiError } from "../utils.js"
import { apiErrors } from "../errors.js"

export async function createSoundReport(
	parent: any,
	args: { uuid: string; description: string },
	context: ResolverContext
): Promise<SoundReport> {
	// Find the sound
	let sound = await context.prisma.sound.findFirst({
		where: { uuid: args.uuid }
	})

	if (sound == null) {
		throwApiError(apiErrors.soundNotExists)
	}

	// Validate the args
	throwValidationError(validateDescriptionLength(args.description))

	// Create the report
	return await context.prisma.soundReport.create({
		data: {
			uuid: crypto.randomUUID(),
			userId: context.user?.id ?? null,
			description: args.description,
			sound: { connect: { id: sound.id } }
		}
	})
}
