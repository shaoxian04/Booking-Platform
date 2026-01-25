package com.booking.common.enums;

public enum ResultCode {
    MSG_200("EXECUTE_SUCCESS", "Service executed successfully"),
    REPEATED_SUBMISSION("REPEATED_SUBMITTED", "Repeated submission"),
    DATABASE_ACCESS_EXCEPTION("DATABASE_ACCESS_EXCEPTION", "Database access exception"),
    ILLEGAL_ARGUMENT("ILLEGAL_ARGUMENT", "Illegal argument exception"),
    RUNTIME_EXCEPTION("RUNTIME_EXCEPTION", "Runtime Exception"),
    UNKNOWN_EXCEPTION("UNKNOWN_EXCEPTION", "Unknown exception");

    public String getDesc() {
        return desc;
    }

    public String getCode() {
        return code;
    }

    private final String code;

    private final String desc;

    ResultCode(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
