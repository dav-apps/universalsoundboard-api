import { throwEndpointError } from "../utils.js"
import { apiErrors, validationErrors } from "../errors.js"

//#region Endpoint validations
export async function validateAudioContentType(contentType: string) {
	if (
		!["audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg"].includes(
			contentType
		)
	) {
		throwEndpointError(apiErrors.contentTypeNotSupported)
	}
}
//#endregion

//#region Field validations
export function validateNameLength(name: string) {
	if (name.length < 2) {
		return validationErrors.nameTooShort
	} else if (name.length > 60) {
		return validationErrors.nameTooLong
	}
}
//#endregion
