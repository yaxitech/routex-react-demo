package tech.yaxi.demo.web;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tech.yaxi.demo.TicketService;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@RestController
@RequestMapping("/ticket")
public class TicketController {

    private final TicketService ticketService;

    @Autowired
    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @CrossOrigin(origins = "*")
    @PostMapping(produces = APPLICATION_JSON_VALUE)
    String createTicket(@RequestParam("service") String service, @RequestBody Map<String, Object> ticketData) {
        var ticket = ticketService.issueTicket(service, ticketData);
        return "\"" + ticket.serialized() + "\"";
    }
}
