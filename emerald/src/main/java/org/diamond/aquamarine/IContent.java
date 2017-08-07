package org.diamond.aquamarine;

import org.springframework.core.io.InputStreamResource;

public interface IContent extends IContentInfo {
    InputStreamResource getData();
}
