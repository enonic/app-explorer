export default interface JsonModalState {
	header: string
	open: boolean
	parsedJson: Record<string,unknown>
}
