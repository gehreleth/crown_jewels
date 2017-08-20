package org.diamond.aquamarine;

import org.springframework.core.io.AbstractResource;

public interface IContent extends IContentInfo {
    AbstractResource getData();
}
