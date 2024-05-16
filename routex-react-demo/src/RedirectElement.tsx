import { ButtonGroup, Button } from "@adobe/react-spectrum";
import { useState } from "react";
import { RedirectHandle, RoutexClient } from "routex-client";
import ResponseError, { ErrorAndTraceId } from "./ResponseError";

export default function RedirectElement({
  service,
  client,
  ticket,
  handle,
}: {
  service: "CollectPayment" | "Transactions";
  client: RoutexClient;
  ticket: string;
  handle: RedirectHandle;
}) {
  let [error, setError] = useState<null | ErrorAndTraceId>(null);
  let [redirectInFlight, setRedirectInFlight] = useState(false);

  function followRedirect() {
    setRedirectInFlight(true);

    localStorage.setItem(
      "redirectState",
      JSON.stringify({
        service,
        ticket,
        context: Array.from(handle.context),
      }),
    );

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("fromRedirect", "1");

    client
      .registerRedirectUri({
        ticket,
        handle: handle.handle,
        redirectUri: currentUrl.toString(),
      })
      .then(
        (url) => {
          window.location.replace(url);
        },
        (error) => setError({ error, traceId: client.traceId() }),
      );
  }

  return (
    <>
      {error && <ResponseError client={client} ticket={ticket} error={error} />}
      <ButtonGroup>
        <Button
          variant="primary"
          onPress={followRedirect}
          isPending={redirectInFlight}
        >
          Redirect me
        </Button>
      </ButtonGroup>
    </>
  );
}
