type Locale = {
	getCountry :() => string
	getDisplayCountry :(locale :Locale) => string
	getDisplayLanguage :(locale :Locale) => string
	getDisplayName :(locale :Locale) => string
	getDisplayVariant :(locale :Locale) => string
	getLanguage :() => string
	toLanguageTag :() => string
	getVariant :() => string
};

type JavaLocale = unknown;

declare const __ :{
	newBean :<T>(s :string) => T
	toNativeObject :<T>(t :T) => T
}

declare const Java :{
	from :(javaLocales :Array<JavaLocale>) => Array<Locale>,
	type :<T>(s :string) => T
};


const {forLanguageTag} = Java.type<
	{forLanguageTag :(locale :string) => Locale}
		>('java.util.Locale');


export const getLocales = ({
	locale = undefined,
	query = ''
} : {
	locale ?:string
	query ?:string
} = {}) => {
	const uniqTagObj = {};
	Java.from(
		__.newBean<
			{getLocales :(query :string) => Array<JavaLocale>}
				>('com.enonic.explorer.Locales').getLocales(query)
	).forEach((l) => {
		const tag = l.toLanguageTag();
		if (!uniqTagObj[tag]) {
			uniqTagObj[tag] = {
				country: l.getCountry(),
				displayCountry: l.getDisplayCountry(locale ? forLanguageTag(locale) : l),
				displayLanguage: l.getDisplayLanguage(locale ? forLanguageTag(locale) : l),
				displayName: l.getDisplayName(locale ? forLanguageTag(locale) : l), // not null!
				displayVariant: l.getDisplayVariant(locale ? forLanguageTag(locale) : l),
				language: l.getLanguage(), // not null! uniq?
				tag, // uniq & not null!
				variant: l.getVariant()
			};
		}
	});
	return Object.keys(uniqTagObj).sort().map((k) => uniqTagObj[k]);
};
