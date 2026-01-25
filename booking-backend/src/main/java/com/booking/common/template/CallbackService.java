package com.booking.common.template;

import com.booking.common.result.BaseResult;

public abstract class CallbackService<T, R extends BaseResult> {

    protected abstract void checkParams(T request);

    protected abstract R createDefaultResult();

    protected abstract void process(T request, R result);

}
