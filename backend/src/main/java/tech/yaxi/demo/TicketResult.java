package tech.yaxi.demo;

import java.util.UUID;

public record TicketResult<T>(UUID id, T data) {

}
