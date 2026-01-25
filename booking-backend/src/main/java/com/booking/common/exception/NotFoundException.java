package com.booking.common.exception;

public class NotFoundException extends RuntimeException {
    public NotFoundException(Object object) {
        super("The object " + (object == null ? "NULL" : object) + " is not found in the DB");
    }

    public NotFoundException(String msg) {
        super(msg);
    }
}
