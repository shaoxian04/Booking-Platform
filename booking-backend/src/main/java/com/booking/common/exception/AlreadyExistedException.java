package com.booking.common.exception;

public class AlreadyExistedException extends RuntimeException {

    public AlreadyExistedException(Object object) {
        super("The entity = " + (object == null ? "NULL" : object) + " is already existed in the database");
    }

    public AlreadyExistedException(String msg) {
        super(msg);
    }
}
