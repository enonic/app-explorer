import type {AnyObject} from './Utility.d';


export type Request<
	Params extends AnyObject = AnyObject,
	PathParams extends AnyObject = AnyObject
> = {
	body?: string
	headers?: { // HTTPS/2 uses lowercase header keys
		accept?: string
		authorization?: string
	}
	method?: string
	params?: Params
	pathParams?: PathParams
}
