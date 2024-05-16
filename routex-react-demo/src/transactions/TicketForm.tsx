import {
  Button,
  ButtonGroup,
  Form,
  InlineAlert,
  Heading,
  Content,
  Text,
  TextField,
  Well,
} from "@adobe/react-spectrum";
import { useState } from "react";
import { issueTicket } from "../utils";

type TicketData = {
  account: {
    iban: string;
    currency: "EUR";
  };
  // Date pattern: `\d{4}-\d{2}-\d{2}`
  range: {
    from: string;
    to?: string;
  };
  webhook?: string;
};

function emptyTicketData(): TicketData {
  return {
    account: {
      iban: "",
      currency: "EUR",
    },
    range: {
      from: "",
      to: undefined,
    },
  };
}

function TicketForm({
  onDone,
}: {
  onDone: (ticket: string, ticketData: TicketData) => void;
}) {
  let [error, setError] = useState<any>(null);
  let [ticket, setTicket] = useState("");
  let [ticketData, setTicketData] = useState<TicketData>(emptyTicketData);
  let [requestInFlight, setRequestInFlight] = useState(false);

  return (
    <>
      <p>
        The first step for retrieving <em>Transactions</em> is to issue a{" "}
        <em>ticket</em>. The ticket contains information such as for which bank
        account the transactions should be fetched and is also your frontend's
        authentication with the YAXI API. Issuing a ticket is typically
        something that is done by your app's backend, which then passes the
        ticket to your app's frontend.
      </p>
      <p>
        Which data to use in the ticket and where it comes from depends on your
        use case. This demo doesn't assume any use case, so please enter the
        ticket data below.
      </p>
      <Form
        validationBehavior="native"
        onSubmit={(e) => {
          e.preventDefault();
          setRequestInFlight(true);
          setError(null);
          issueTicket("Transactions", ticketData)
            .then(setTicket, setError)
            .finally(() => setRequestInFlight(false));
        }}
        isDisabled={ticket !== ""}
      >
        <TextField
          label="IBAN"
          value={ticketData.account.iban}
          onChange={(value) =>
            setTicketData({
              ...ticketData,
              account: {
                ...ticketData.account,
                iban: value,
              },
            })
          }
          isRequired
        />
        <TextField
          label="From"
          value={ticketData.range.from}
          onChange={(value) =>
            setTicketData({
              ...ticketData,
              range: {
                ...ticketData.range,
                from: value,
              },
            })
          }
          pattern="\d{4}-\d{2}-\d{2}"
          placeholder="YYYY-MM-DD"
          isRequired
        />
        <TextField
          label="To"
          value={ticketData.range.to}
          onChange={(value) =>
            setTicketData({
              ...ticketData,
              range: {
                ...ticketData.range,
                to: value.length > 0 ? value : undefined,
              },
            })
          }
          pattern="\d{4}-\d{2}-\d{2}"
          placeholder="YYYY-MM-DD"
        />
        <TextField
          label="Webhook URL"
          value={ticketData.webhook}
          onChange={(value) =>
            setTicketData({
              ...ticketData,
              webhook: value.length > 0 ? value : undefined,
            })
          }
          description="The HTTPS URL that points to your running backend."
        />
        <ButtonGroup>
          <Button type="submit" variant="primary" isPending={requestInFlight}>
            Issue ticket
          </Button>
        </ButtonGroup>
      </Form>

      {error && (
        <InlineAlert variant="negative" marginTop="1rem">
          <Heading>Could not create ticket :(</Heading>
          <Content>
            <Text>{error.toString()}</Text>
          </Content>
        </InlineAlert>
      )}

      {ticket && (
        <>
          <p>This demo's backend issued a ticket with the following data:</p>
          <Well>
            <pre>{JSON.stringify(ticketData, null, "  ")}</pre>
          </Well>
          <p>
            This ticket can be used to initiate a{" "}
            <span className="code">Transactions</span> service. To do so, you
            need some additional data though. You will learn more about this in
            the next step.
          </p>
          <ButtonGroup>
            <Button
              variant="primary"
              onPress={() => onDone(ticket, ticketData)}
            >
              Let's go!
            </Button>
            <Button
              variant="secondary"
              onPress={() => {
                setError(null);
                setTicket("");
              }}
            >
              I want to change some ticket data
            </Button>
          </ButtonGroup>
        </>
      )}
    </>
  );
}

export default TicketForm;
