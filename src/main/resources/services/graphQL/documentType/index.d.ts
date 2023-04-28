import type {
	AnyObject,
	DocumentType
} from '@enonic-types/lib-explorer';


export type DocumentTypeEnv<
	Args extends AnyObject = AnyObject
> = {
	args :Args
	context :AnyObject
	source :DocumentType
}
