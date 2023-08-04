import type {AnyObject} from './Utility.d';


export type Request<
	Params extends AnyObject = AnyObject,
	PathParams extends AnyObject = AnyObject
> = {
	body?: string
	contentType?: string
	contextPath: string
	headers?: { // HTTPS/2 uses lowercase header keys
		accept?: string
		authorization?: string
	}
	method?: string
	params?: Params
	path: string
	pathParams?: PathParams
	rawPath: string
	url: string
}
