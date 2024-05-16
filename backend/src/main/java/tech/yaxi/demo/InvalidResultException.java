package tech.yaxi.demo;

public class InvalidResultException extends RuntimeException {

    public InvalidResultException(Throwable throwable) {
        super(throwable);
    }

    public InvalidResultException(String message) {
        super(message);
    }
}
