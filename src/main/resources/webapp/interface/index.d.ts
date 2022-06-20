export namespace GraphQL {
	export type EnumType = unknown
	export type EnumValues = Array<string>|Record<string,string>

	/*export type ScalarType =
		|typeof GraphQLInt // These are Java types, so typeof won't work well on them...
		|typeof GraphQLString
		|...
	*/
	export type ScalarType = unknown

	export type InputObjectType = unknown
	export type ArgsType = ScalarType|InputObjectType
}
