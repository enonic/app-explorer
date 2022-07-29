export type InputTypeLanguageSynonym = {
	// Required
	synonym :string
	// Optional
	comment ?:string
	disabledInInterfaces ?:Array<string>
	enabled ?:boolean
}

export type InputTypeSynonymLanguage = {
	// Required
	locale :string
	// Optional
	both ?:Array<InputTypeLanguageSynonym>
	comment ?:string
	disabledInInterfaces ?:Array<string>
	enabled ?:boolean
	from ?:Array<InputTypeLanguageSynonym>
	to ?:Array<InputTypeLanguageSynonym>
}

export type InputTypeSynonymLanguages = Array<InputTypeSynonymLanguage>
