package tech.yaxi.demo.web;

import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.convert.converter.Converter;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tech.yaxi.demo.TicketService;
import tech.yaxi.demo.model.Transaction;

@RestController
@RequestMapping("/results")
public class WebhookController {

    private final TicketService ticketService;
    private final ObjectMapper objectMapper;

    @Autowired
    public WebhookController(TicketService ticketService, ObjectMapper objectMapper) {
        this.ticketService = ticketService;
        this.objectMapper = objectMapper;
    }

    @CrossOrigin(origins = "*")
    @PostMapping
    void processTransactions(@RequestBody String transactions) {
        Converter<List<Object>, List<Transaction>> converter = (xs) -> xs.stream()
                .map(transaction -> objectMapper.convertValue(transaction, Transaction.class))
                .toList();
        var result = ticketService.verifyResults(transactions, converter);
        System.out.println(result.id());
        System.out.println(result.data());
    }
}
