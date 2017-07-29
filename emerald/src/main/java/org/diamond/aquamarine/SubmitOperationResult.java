package org.diamond.aquamarine;

import java.time.Instant;

public class SubmitOperationResult {
    private final Status result;

    private final Instant timestamp;

    private final String message;

    private SubmitOperationResult(Status result, Instant timestamp, String message) {
        this.result = result;
        this.timestamp = timestamp;
        this.message = message;
    }

    public static SubmitOperationResult makeSuccess() {
        return new SubmitOperationResult(Status.SUCCESS, Instant.now(), null);
    }

    public static SubmitOperationResult makeFail(String reason) {
        return new SubmitOperationResult(Status.FAIL, Instant.now(), reason);
    }

    public Status getResult() {
        return result;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public String getMessage() {
        return message;
    }

    public enum Status {
        SUCCESS, FAIL
    }
}
