package com.booking.common.enums;

public enum Role {

    PROVIDER("PROVIDER"),
    ADMIN("ADMIN"),
    VIEWER("VIEWER");

    private final String code;

    Role(String id) {
        this.code = id;
    }

    public String getCode() {
        return code;
    }
}
