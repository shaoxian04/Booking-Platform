package com.booking.common;

public enum Role {

    PROVIDER("PROVIDER"),
    ADMIN("ADMIN"),
    VIEWER("VIEWER");

    private final String id;

    Role(String id) {
        this.id = id;
    }
}
