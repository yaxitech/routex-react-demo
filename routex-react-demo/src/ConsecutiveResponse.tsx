import {
  Dialog,
  RedirectHandle,
  OBResponse,
  Result,
  RoutexClient,
} from "routex-client";
import DialogForm from "./DialogForm";
import RedirectElement from "./RedirectElement";
import { Button, ButtonGroup, InlineAlert } from "@adobe/react-spectrum";

export default function ConsecutiveResponse({
  service,
  client,
  ticket,
  response,
  onResponse,
  onStartAgain,
}: {
  service: "CollectPayment" | "Transactions";
  client: RoutexClient;
  ticket: string;
  response: OBResponse;
  onResponse: (response: OBResponse) => void;
  onStartAgain: () => void;
}) {
  if (response instanceof Dialog) {
    return (
      <DialogForm
        service={service}
        client={client}
        ticket={ticket}
        dialog={response}
        onResponse={onResponse}
      />
    );
  } else if (response instanceof RedirectHandle) {
    return (
      <RedirectElement
        service={service}
        client={client}
        ticket={ticket}
        handle={response}
      />
    );
  } else if (response instanceof Result) {
    return (
      <>
        <p>
          Success! The response was now a <span className="code">Result</span>,
          which means the process is now complete.{" "}
          {service === "Transactions" &&
            "The transactions data was sent to the webhook."}
        </p>
        <p>
          A result also has a field <span className="code">connectionData</span>
          . It's a specific value for the bank account and connection that has
          been used and contains long-lived connection data. Passing it the next
          time when a process is initiated can avoid authentication and
          authorization steps, so it's recommended that your app stores it.
        </p>
        <ButtonGroup>
          <Button variant="primary" onPress={onStartAgain}>
            Start again
          </Button>
        </ButtonGroup>
      </>
    );
  } else {
    return (
      <InlineAlert variant="negative">
        Got an unexpected response: {response.toString()}
      </InlineAlert>
    );
  }
}
