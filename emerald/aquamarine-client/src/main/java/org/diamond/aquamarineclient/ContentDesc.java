package org.diamond.aquamarineclient;

import java.util.UUID;

public interface ContentDesc {
    UUID getUUID();
    String getMimeType();
    long getLength();
}
