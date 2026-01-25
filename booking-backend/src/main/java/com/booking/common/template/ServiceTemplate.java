package com.booking.common.template;

import com.booking.common.enums.ResultCode;
import com.booking.common.exception.AlreadyExistedException;
import com.booking.common.result.BaseResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Component;

@Component
public class ServiceTemplate {

    private static final Logger log = LoggerFactory.getLogger(ServiceTemplate.class);


    public <T, R extends BaseResult> R execute(T request, CallbackService<T, R> callbackService) {
        log.info("service begins, request =[{}]", request);

        final R result = callbackService.createDefaultResult();

        try {

            callbackService.checkParams(request);

            callbackService.process(request, result);

            fillSuccessResult(result);

        }catch (BadCredentialsException e) {
            log.error("Invalid username or password, request = {}", request);
            throw e;

        }catch (AlreadyExistedException e) {
            log.error("Username or Email already existed, request = {}", request);
            throw e;

        } catch (DuplicateKeyException e) {
            log.error("DuplicateKeyException caught, request = {}", request, e);
            fillExceptionResult(result, ResultCode.REPEATED_SUBMISSION);
            throw e;

        } catch (DataAccessException e) {
            log.error("DataAccessException caught, request = {}", request, e);
            fillExceptionResult(result, ResultCode.DATABASE_ACCESS_EXCEPTION);

        } catch (IllegalArgumentException e) {
            log.error("IllegalArgumentException caught, {}, request = {}", e.getMessage(), request, e);
            fillExceptionResult(result, ResultCode.ILLEGAL_ARGUMENT);

        } catch (RuntimeException e) {
            log.error("{}, request = {}", e.getMessage(), request, e);
            fillExceptionResult(result, ResultCode.RUNTIME_EXCEPTION);

        } catch (Exception e) {
            log.error("UnknownException caught, request = {}", request, e);
            fillExceptionResult(result, ResultCode.UNKNOWN_EXCEPTION);

        } finally {
            log.info("service result [{}]", result);
        }
        return result;
    }

    private void fillSuccessResult(BaseResult result) {
        result.setSuccess(true);
        result.setResultCode(ResultCode.MSG_200.getCode());
        result.setResultMsg(ResultCode.MSG_200.getDesc());
    }

    private void fillExceptionResult(BaseResult result, ResultCode code) {
        result.setSuccess(false);
        result.setResultCode(code.getCode());
        result.setResultMsg(code.getDesc());
    }

}
