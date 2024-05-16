import { Button, ButtonGroup, Flex } from "@adobe/react-spectrum";
import { OBResponse, RoutexClient } from "routex-client";
import { useState } from "react";
import ResponseError, { ErrorAndTraceId } from "./ResponseError";

export default function ReturnedFromRedirect({
  service,
  client,
  ticket,
  context,
  onResponse,
}: {
  service: "CollectPayment" | "Transactions";
  client: RoutexClient;
  ticket: string;
  context: Uint8Array;
  onResponse: (response: OBResponse) => void;
}) {
  let [error, setError] = useState<null | ErrorAndTraceId>(null);

  function confirm() {
    let promise: Promise<OBResponse>;
    if (service === "CollectPayment") {
      promise = client.confirmCollectPayment({ ticket, context });
    } else {
      promise = client.confirmTransactions({ ticket, context });
    }
    promise.then(
      (response) => onResponse(response),
      (error) => setError({ error, traceId: client.traceId() }),
    );
  }

  return (
    <Flex direction="column">
      <p>
        The app just returned from a redirect. It now needs to call{" "}
        <span className="code">
          {service === "CollectPayment"
            ? "confirmCollectPayment"
            : "confirmTransactions"}
        </span>{" "}
        to retrieve the next <span className="code">Response</span>.
      </p>
      {error && <ResponseError client={client} ticket={ticket} error={error} />}
      <ButtonGroup>
        <Button variant="primary" onPress={confirm}>
          Continue
        </Button>
      </ButtonGroup>
    </Flex>
  );
}
