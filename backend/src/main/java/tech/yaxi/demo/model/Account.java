package tech.yaxi.demo.model;

import java.util.Optional;

public record Account(
        Optional<String> iban,
        Optional<String> number,
        Optional<String> bic,
        Optional<String> bankCode,
        Optional<String> currency,
        Optional<String> name,
        Optional<String> displayName,
        Optional<String> ownerName,
        Optional<String> productName,
        Optional<Status> status) {

    public static enum Status {
        AVAILABLE,
        TERMINATED,
        BLOCKED,
    }
}
