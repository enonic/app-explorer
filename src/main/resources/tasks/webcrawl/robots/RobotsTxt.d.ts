export interface RobotsTxt {
	isAllowed: (userAgent: string, path: string) => boolean
	isDisallowAll: (userAgent: string) => boolean
	isIndexable: (userAgent: string, path: string) => boolean
}
