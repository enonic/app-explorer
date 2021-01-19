const {forLanguageTag} = Java.type('java.util.Locale');

export const getLocales = ({
	locale = undefined,
	query = ''
} = {}) => {
	const uniqTagObj = {};
	Java.from(
		__.newBean('com.enonic.explorer.Locales').getLocales(query)
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
