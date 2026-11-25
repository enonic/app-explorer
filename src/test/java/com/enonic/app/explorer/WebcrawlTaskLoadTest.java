package com.enonic.app.explorer;

import java.lang.reflect.Proxy;

import com.enonic.xp.extractor.BinaryExtractor;
import com.enonic.xp.node.NodeService;
import com.enonic.xp.repository.RepositoryService;
import com.enonic.xp.script.event.ScriptEventManager;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.testing.ScriptRunnerSupport;

public class WebcrawlTaskLoadTest
    extends ScriptRunnerSupport
{
    @Override
    public String getScriptTestFile()
    {
        return "/tasks/webcrawlTaskLoad.test.js";
    }

    @Override
    protected void initialize()
        throws Exception
    {
        super.initialize();
        addStub( NodeService.class );
        addStub( BinaryExtractor.class );
        addStub( RepositoryService.class );
        addStub( ScriptEventManager.class );
        addStub( SecurityService.class );
    }

    private <T> void addStub( final Class<T> type )
    {
        addService( type, type.cast( Proxy.newProxyInstance( type.getClassLoader(), new Class<?>[]{type}, ( proxy, method, args ) -> null ) ) );
    }
}
