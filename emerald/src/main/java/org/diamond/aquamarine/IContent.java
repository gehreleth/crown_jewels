package org.diamond.aquamarine;

import org.springframework.core.io.InputStreamResource;

public interface IContent {
    String getMimeType();
    long getLength();
    InputStreamResource getData();
}
