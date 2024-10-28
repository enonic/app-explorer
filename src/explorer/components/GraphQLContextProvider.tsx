import { GraphQLClient, ClientContext } from 'graphql-hooks';


function GraphQLContextProvider({
	basename,
	children,
}: {
	basename: string
	children: React.ReactNode
}) {
	const client = new GraphQLClient({
		url: `${basename}/_/service/com.enonic.app.explorer/graphQL`
	});
	return <ClientContext.Provider value={client}>
		{children}
	</ClientContext.Provider>;
}


export default GraphQLContextProvider;
