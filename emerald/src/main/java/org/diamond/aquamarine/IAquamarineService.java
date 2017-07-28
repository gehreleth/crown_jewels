package org.diamond.aquamarine;

import org.springframework.scheduling.annotation.Async;

import java.io.File;
import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.Future;

/**
 * Created by serge on 7/28/2017.
 */
public interface IAquamarineService {
    /**
     *
     * @param uuid
     * @return memeType/length/InputStreamResource
     * @throws IOException
     */
    IContent retrieveContent(UUID uuid) throws IOException;

    @Async
    Future<SubmitOperationResult> submitNewCollection(String formName, File temporaryFile);
}
