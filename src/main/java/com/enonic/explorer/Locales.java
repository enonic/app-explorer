package com.enonic.explorer;

import java.util.Arrays;
import java.util.Locale;

//import static com.google.common.base.Strings.isNullOrEmpty;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
//import com.enonic.explorer.LocaleListJson;


//public class Locales implements ScriptBean
//public abstract class Locales implements ScriptBean
public final class Locales implements ScriptBean
{

	//public List<String> getLocales()
	public Locale[] getLocales()
	{
		return Locale.getAvailableLocales();
	}

	/*public LocaleListJson getLocales()
	{
		Locale[] locales = Locale.getAvailableLocales();
		locales = Arrays.stream( locales ).
		filter( ( locale ) -> !isNullOrEmpty( locale.toLanguageTag() ) && !isNullOrEmpty( locale.getDisplayName() ) ).
		toArray( Locale[]::new );
		return new LocaleListJson( locales );
	}*/

	/*public LocaleListJson getLocales( @QueryParam("query") final String query )
    {
        Locale[] locales = Locale.getAvailableLocales();
        if ( !nullToEmpty( query ).isBlank() )
        {
            String trimmedQuery = query.trim().toLowerCase();
            locales = Arrays.stream( locales ).
                filter( locale -> nullToEmpty( locale.toLanguageTag() ).toLowerCase().contains( trimmedQuery ) ||
                    nullToEmpty( locale.getDisplayName( locale ) ).toLowerCase().contains( trimmedQuery ) ||
                    nullToEmpty( locale.getLanguage() ).toLowerCase().contains( trimmedQuery ) ||
                    nullToEmpty( locale.getDisplayLanguage( locale ) ).toLowerCase().contains( trimmedQuery ) ||
                    nullToEmpty( locale.getVariant() ).toLowerCase().contains( trimmedQuery ) ||
                    nullToEmpty( locale.getDisplayVariant( locale ) ).toLowerCase().contains( trimmedQuery ) ||
                    nullToEmpty( locale.getCountry() ).toLowerCase().contains( trimmedQuery ) ||
                    nullToEmpty( locale.getDisplayCountry( locale ) ).toLowerCase().contains( trimmedQuery ) ||
                    nullToEmpty( getFormattedDisplayName( locale ) ).toLowerCase().contains( trimmedQuery ) &&
                        !isNullOrEmpty( locale.toLanguageTag() ) && !isNullOrEmpty( locale.getDisplayName() ) ).
                toArray( Locale[]::new );
        }
        else
        {
            locales = Arrays.stream( locales ).
                filter( ( locale ) -> !isNullOrEmpty( locale.toLanguageTag() ) && !isNullOrEmpty( locale.getDisplayName() ) ).
                toArray( Locale[]::new );
        }
        return new LocaleListJson( locales );
    }*/
	@Override
    public void initialize( final BeanContext context )
    {
        //no-op
    }
}
