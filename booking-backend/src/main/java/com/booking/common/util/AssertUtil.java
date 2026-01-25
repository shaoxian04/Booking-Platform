package com.booking.common.util;

import org.springframework.stereotype.Component;

@Component
public class AssertUtil {

    public static void isTrue(boolean condition, RuntimeException e) {
        if (!condition) {
            throw e;
        }
    }

    public static void isNull(Object object, RuntimeException e) {
        isTrue(object == null, e);
    }

    public static void notNull(Object object, IllegalArgumentException e) {
        if (object == null || object == "") {
            throw e;
        }
    }
}
