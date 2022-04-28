export type JSONResponse<Data extends unknown = unknown> = {
	data? :Data
	errors?: Array<{message: string}>
}
