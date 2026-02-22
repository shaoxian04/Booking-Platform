package com.booking.common.exception;

public class FullyBookedException extends RuntimeException {

    public FullyBookedException(String msg) {
        super(msg);
    }
}
