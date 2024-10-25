package com.enonic.app.explorer.etag;

import com.google.common.hash.Hashing;


public class Hasher
{
    public String getHash( byte[] contentBytes )
    {
        return Hashing.farmHashFingerprint64().
            hashBytes( contentBytes ).
            toString();
    }
}
