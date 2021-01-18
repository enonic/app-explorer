package com.enonic.explorer;

import java.util.Arrays;
import java.util.Locale;

import static com.google.common.base.Strings.isNullOrEmpty;
import static com.google.common.base.Strings.nullToEmpty;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;


public final class Locales implements ScriptBean
{
	private String getFormattedDisplayName( Locale locale )
    {
        return locale.getDisplayName( locale ) + " (" + locale.toLanguageTag() + ")";
    }

	public Locale[] getLocales( final String query )
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
		return locales;
    }

	@Override
    public void initialize( final BeanContext context )
    {
        //no-op
    }
}
