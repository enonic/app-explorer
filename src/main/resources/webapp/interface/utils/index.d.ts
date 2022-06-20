export type Branch<Leaf = string> = {
	[x :string]: Leaf|Branch
}

export type Fields = AnyObject;

export type GraphQLObjectType = unknown;
type GraphQLInterfaceType = unknown;
type GraphQLTypeReference = string;

export type FieldResolver<
	Env extends AnyObject = AnyObject,
	ResultGraph extends AnyObject = AnyObject
> = (env :Env) => ResultGraph
export type TypeResolver<Node extends AnyObject = AnyObject> = (node :Node) => GraphQLObjectType

export type Interfaces = Array<GraphQLInterfaceType|GraphQLTypeReference>
export type Types = Array<GraphQLObjectType|GraphQLTypeReference>
