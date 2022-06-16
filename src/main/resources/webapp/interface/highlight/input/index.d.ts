export type HightlightPropertyOptions = {
	fieldPath :string
	fragmenter ?:'simple'|'span'
	fragmentSize ?:number
	noMatchSize ?:number
	numberOfFragments ?:number
	order ?:string
	postTag ?:string
	preTag ?:string
	requireFieldMatch ?:boolean
};

export type Highlight = {
	encoder ?:'default'|'html'
	properties :Array<HightlightPropertyOptions>
	tagsSchema ?:'styled'
} & HightlightPropertyOptions;
