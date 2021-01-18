const {forLanguageTag} = Java.type('java.util.Locale');

export const getLocales = ({
	locale = undefined,
	query = ''
} = {}) => Java.from(
	__.newBean('com.enonic.explorer.Locales').getLocales(query)
).map((l) => ({
	country: l.getCountry(),
	displayCountry: l.getDisplayCountry(locale ? forLanguageTag(locale) : l),
	displayLanguage: l.getDisplayLanguage(locale ? forLanguageTag(locale) : l),
	displayName: l.getDisplayName(locale ? forLanguageTag(locale) : l),
	displayVariant: l.getDisplayVariant(locale ? forLanguageTag(locale) : l),
	language: l.getLanguage(),
	tag: l.toLanguageTag(),
	variant: l.getVariant()
}));
