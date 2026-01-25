package com.booking.common.result;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
public abstract class BaseResult {
    private boolean isSuccess = false;

    private String resultCode;

    private String resultMsg;
}
