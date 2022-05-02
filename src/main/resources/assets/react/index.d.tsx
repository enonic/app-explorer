export type CollectionValues = {
	_id ?:string
	_name :string
	_path :string
	collector :{
		configJson ?:string
		config ?:{}
		name :string
	}
	cron :Array<{
		month :string
		dayOfMonth :string
		dayOfWeek :string
		minute :string
		hour :string
	}>
	doCollect :boolean
	documentTypeId ?:string
	language :string
};

export type ContentTypeOptions = Array<unknown>;
export type SiteOptions = Array<unknown>;

export type Fields = Record<string,{
	label :string
}>;

export type CollectorProps = {
	context :{
		values :unknown
	}
	dispatch :(theThing:unknown) => void
	explorer :{
		contentTypeOptions :ContentTypeOptions
		fields :Fields
		siteOptions :SiteOptions
	}
	isFirstRun :{
		current :boolean
	}
	path :string
};

export type CollectorComponent = (props :CollectorProps) => JSX.Element;
export type CollectorComponents = Record<string,CollectorComponent>;

export type Locale = {
	country :string
	displayName :string
	tag :string
}
export type Locales = Array<Locale>

export type SetLicensedToFunction = (to :string) => void;
export type SetLicenseValidFunction = (valid :boolean) => void;
