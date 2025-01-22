import { ApiError } from "../types.js"
import { apiErrors, validationErrors } from "../errors.js"

//#region Endpoint validations
export function validateJsonContentType(
	contentType: string
): ApiError | undefined {
	if (contentType == null || !contentType.includes("application/json")) {
		return apiErrors.contentTypeNotSupported
	}
}

export function validateAudioContentType(
	contentType: string
): ApiError | undefined {
	if (
		contentType == null ||
		!["audio/mpeg", "audio/m4a", "audio/wav", "audio/ogg"].includes(
			contentType
		)
	) {
		return apiErrors.contentTypeNotSupported
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

export function validateDescriptionLength(description: string) {
	if (description.length > 5000) {
		return validationErrors.descriptionTooLong
	}
}

export function validateCurrency(currency: string) {
	if (!["EUR", "USD"].includes(currency.toUpperCase())) {
		return validationErrors.currencyInvalid
	}
}
//#endregion
