package com.enonic.app.explorer;

import com.enonic.xp.testing.ScriptRunnerSupport;

public class AddMutationCollectionDeleteTest
    extends ScriptRunnerSupport
{
    @Override
    public String getScriptTestFile()
    {
        return "/graphql/addMutationCollectionDelete.test.js";
    }
}
