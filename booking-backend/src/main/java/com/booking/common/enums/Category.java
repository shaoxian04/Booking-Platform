package com.booking.common.enums;

import java.util.Arrays;
import java.util.List;

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

    public static void validateList(List<String> categories) {
        if (categories == null) {
            return;
        }
        for (String category : categories) {
            if (!isValid(category)) {
                throw new IllegalArgumentException("Invalid category: " + category);
            }
        }
    }
}
