export interface GraphQLField<
	Args extends {} = {},
	ResolveArgs extends {} = {},
	ResolvesTo extends unknown = undefined
> {
	args :Args,
	resolve :(env :{
		args :ResolveArgs
	}) => ResolvesTo,
	type :string
}
