package com.booking.common.util;

public class AssertUtil {

    public static void isTrue (boolean condition, RuntimeException e){
        if(!condition){
            throw e;
        }
    }

    public static void isNull (Object object, RuntimeException e){
        isTrue(object == null, e);
    }
}
