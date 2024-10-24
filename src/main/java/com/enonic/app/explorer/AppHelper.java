package com.enonic.app.explorer;

import com.enonic.xp.resource.ResourceKey;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;


public class AppHelper implements ScriptBean {
	public ResourceKey toResourceKey( final String resourceUri )
	{
		return ResourceKey.from( resourceUri );
	}

	@Override
	public void initialize( final BeanContext context )
	{
		// no-op
	}
}
