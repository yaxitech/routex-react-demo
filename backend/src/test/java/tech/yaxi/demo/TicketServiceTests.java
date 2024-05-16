package tech.yaxi.demo;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

import com.nimbusds.jwt.SignedJWT;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;

public class TicketServiceTests {

    private static final UUID ID = UUID.fromString("a9523f11-f87a-41e6-a000-647a1b4eea35");
    private final TicketService ticketService = new TicketService(
            "test-key-id",
            "extremely-secret-key-do-not-leak".getBytes(StandardCharsets.UTF_8),
            Clock.fixed(OffsetDateTime.parse("2022-07-07T13:49:00Z").toInstant(), ZoneOffset.UTC),
            () -> ID);

    @Test
    void testIssueTicket() throws ParseException {
        var ticket = ticketService.issueTicket("Transactions", null);
        assertThat(ticket.id()).isEqualTo(ID);
        assertThatNoException().isThrownBy(() -> SignedJWT.parse(ticket.serialized()));
    }

    @Test
    void testIssueAccountsTicket() {
        assertThatNoException().isThrownBy(() -> ticketService.issueTicket("Accounts", null));
    }
}
