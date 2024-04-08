globalThis.Java = {
	type: (path: string) => {
		if (path === 'java.util.Locale') {
			return {
				forLanguageTag: (locale: string) => {
					if (locale === 'en-GB') {
						return 'en';
					}
					throw new Error(`Unmocked java.util.Locale.forLanguageTag locale: '${locale}'`);
				}
			}
		} else if (path === 'java.lang.System') {
			return {
				currentTimeMillis: () => 1 // Don't use 0 as it's falsy
			};
		} else {
			throw new Error(`Unmocked Java.type path: '${path}'`);
		}
	}
}
