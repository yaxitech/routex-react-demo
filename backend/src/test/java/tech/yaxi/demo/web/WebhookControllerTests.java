package tech.yaxi.demo.web;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import tech.yaxi.demo.TicketService;

import static org.assertj.core.api.Assertions.assertThatNoException;

public class WebhookControllerTests {

    private final WebhookController controller = new WebhookController(
            new TicketService("test", "/fVLyhshE5E0kJO8FlX018bMNiemXo0SBAWEv4E4MjrurBZ6gKtWoEAqj4wtfnpumtPoztqxgE4ErAsPv88xhQ=="),
            Jackson2ObjectMapperBuilder.json().build()
    );

    @Test
    void testHook() throws IOException {
        String transactions = new DefaultResourceLoader()
                .getResource("classpath:transactions.txt")
                .getContentAsString(StandardCharsets.UTF_8);
        assertThatNoException().isThrownBy(() -> controller.processTransactions(transactions));
    }
}
