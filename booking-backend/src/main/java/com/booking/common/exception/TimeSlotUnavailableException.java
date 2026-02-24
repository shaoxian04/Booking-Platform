package com.booking.common.exception;

public class TimeSlotUnavailableException extends RuntimeException {

    public TimeSlotUnavailableException(String msg) {
        super(msg);
    }
}
