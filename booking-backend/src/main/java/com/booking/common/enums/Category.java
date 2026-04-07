package com.booking.common.enums;

import java.util.Arrays;

public enum Category {
    FITNESS,
    BEAUTY,
    HEALTH,
    HOME_SERVICES,
    EDUCATION,
    FOOD,
    PETS,
    WELLNESS,
    TECH,
    OTHER;

    public static boolean isValid(String value) {
        if (value == null) {
            return false;
        }
        return Arrays.stream(values()).anyMatch(c -> c.name().equalsIgnoreCase(value));
    }
}
