import type {
	AnyObject,
	DocumentType
} from '/lib/explorer/types/index.d';


export type DocumentTypeEnv<
	Args extends AnyObject = AnyObject
> = {
	args :Args
	context :AnyObject
	source :DocumentType
}
