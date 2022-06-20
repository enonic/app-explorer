export type HightlightPropertyOptions = {
	field :string
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
	fields :Array<HightlightPropertyOptions>
	tagsSchema ?:'styled'
} & HightlightPropertyOptions;
