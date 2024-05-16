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

export type TicketData = {
  amount: {
    amount: string;
    currency: "EUR";
  };
  creditorAccount: {
    iban: string;
  };
  creditorName: string;
  remittance: string;
};

function emptyTicketData(): TicketData {
  return {
    amount: {
      amount: "",
      currency: "EUR",
    },
    creditorAccount: {
      iban: "",
    },
    creditorName: "",
    remittance: "",
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
        The first step for a <em>Collect Payment</em> is to issue a{" "}
        <em>ticket</em>. The ticket contains information such as which bank
        account should receive the money and is also your frontend's
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
          issueTicket("CollectPayment", ticketData)
            .then(setTicket, setError)
            .finally(() => setRequestInFlight(false));
        }}
        isDisabled={ticket !== ""}
      >
        <TextField
          label="Amount"
          value={ticketData.amount.amount}
          onChange={(value) =>
            setTicketData({
              ...ticketData,
              amount: {
                ...ticketData.amount,
                amount: value,
              },
            })
          }
          isRequired
          inputMode="decimal"
          pattern="[0-9]+(?:\.[0-9]{0,2})?"
          description="The amount to collect in EUR. Use . as decimal separator."
          errorMessage="Please enter a decimal number with . a separator, with at most 2 decimals"
        />
        <TextField
          label="Creditor name"
          value={ticketData.creditorName}
          onChange={(value) =>
            setTicketData({
              ...ticketData,
              creditorName: value,
            })
          }
          isRequired
        />
        <TextField
          label="Creditor IBAN"
          value={ticketData.creditorAccount.iban}
          onChange={(value) =>
            setTicketData({
              ...ticketData,
              creditorAccount: {
                iban: value,
              },
            })
          }
          isRequired
        />
        <TextField
          label="Remittance"
          value={ticketData.remittance}
          onChange={(value) =>
            setTicketData({
              ...ticketData,
              remittance: value,
            })
          }
          isRequired
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
            <span className="code">Collect Payment</span> service. To do so, you
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
