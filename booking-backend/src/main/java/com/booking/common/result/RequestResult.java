package com.booking.common.result;


import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class RequestResult<T> extends BaseResult{

    private T data;
}
