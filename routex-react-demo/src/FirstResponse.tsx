import { Flex, Well } from "@adobe/react-spectrum";
import {
  OBResponse,
  Result,
  Dialog,
  RoutexClient,
  Confirmation,
  Field,
  Selection,
  RedirectHandle,
} from "routex-client";
import DialogForm from "./DialogForm";
import { ReactElement } from "react";
import RedirectElement from "./RedirectElement";
import { jwtDecode } from "jwt-decode";

function handleResponse(
  service: "CollectPayment" | "Transactions",
  client: RoutexClient,
  ticket: string,
  response: OBResponse,
  onResponse: (response: OBResponse) => void,
): {
  type: string;
  element: ReactElement | null;
  explanation: ReactElement | null;
} {
  if (response instanceof Result) {
    return {
      type: "Result",
      element: null,
      explanation: (
        <>
          <p>
            A <span className="code">Result</span> is returned when the process
            is complete.{" "}
            {service === "Transactions" &&
              "The data was sent to the webhook if an URL was provided in the ticket."}
          </p>
          {service === "CollectPayment" &&
            describeCollectPaymentResult(response.jwt)}
        </>
      ),
    };
  } else if (response instanceof Dialog) {
    return {
      type: "Dialog",
      element: (
        <DialogForm
          service={service}
          client={client}
          ticket={ticket}
          dialog={response}
          onResponse={onResponse}
          showContinueHint={true}
        />
      ),
      explanation: (
        <>
          <p>
            A <span className="code">Dialog</span> is an interaction with the
            user. It has a field <span className="code">input</span> that
            defines the interactive part, which is either a{" "}
            <span className="code">Confirmation</span>,{" "}
            <span className="code">Selection</span>, or a{" "}
            <span className="code">Field</span>. In this case, it's a{" "}
            <span className="code">{describeInputType(response.input)}</span>.
          </p>
          {describeInput(response.input)}
        </>
      ),
    };
  } else if (response instanceof RedirectHandle) {
    return {
      type: "RedirectHandle",
      element: (
        <RedirectElement
          service={service}
          client={client}
          ticket={ticket}
          handle={response}
        />
      ),
      explanation: (
        <p>
          A <span className="code">RedirectHandle</span> is returned when a
          redirect to an external site is received but the app hasn't called{" "}
          <span className="code">setRedirectUrl</span> yet. The handle can be
          passed to <span className="code">registerRedirectUri</span> to
          register a redirect URL back to your app. Your app will then receive
          the URL to which it should redirect. Once the user finishes the flow
          on the external site, the site will return back to your app via the
          previously registered URL.
        </p>
      ),
    };
  }
  return { type: "something unexpected", element: null, explanation: null };
}

export function describeCollectPaymentResult(
  jwt: string,
): ReactElement | undefined {
  // Note that this decodes the result in the frontend code solely for the purpose of displaying it in this demo.
  // Since the frontend cannot verify the signature without the secret key, the decoded result is unauthenticated and should not be trusted.
  // Your backend must verify the JWT signature before making any decisions based on the signed result data.
  // See, for example, `TicketService#verifyResults` in this demo’s backend code or https://docs.yaxi.tech/verify.html
  type CollectPaymentResultData = {
    debtorIban?: string;
    debtorName?: string;
  };
  const data = jwtDecode<{
    data: { data: CollectPaymentResultData };
  }>(jwt).data.data;

  if (data.debtorIban !== undefined || data.debtorName !== undefined) {
    return (
      <>
        <p>
          The Collect Payment service was instructed to return{" "}
          {(data.debtorIban === undefined || data.debtorName === undefined) &&
            "(some) "}
          debtor identification. The service returned a JWT with the following
          data:
        </p>
        <Well>
          <pre>{JSON.stringify(data, null, "  ")}</pre>
        </Well>
        <p>
          See{" "}
          <a href="https://docs.yaxi.tech/collect-payment.html#_result">
            Collect Payment Result
          </a>{" "}
          for details.
        </p>
      </>
    );
  } else {
    return undefined;
  }
}

function describeInputType(input: Confirmation | Selection | Field): string {
  if (input instanceof Confirmation) {
    return "Confirmation";
  } else if (input instanceof Selection) {
    return "Selection";
  } else if (input instanceof Field) {
    return "Field";
  } else {
    return "something unexpected";
  }
}

function describeInput(
  input: Confirmation | Selection | Field,
): ReactElement | undefined {
  if (input instanceof Confirmation) {
    return (
      <p>
        A <span className="code">Confirmation</span> has an optional property{" "}
        <span className="code">pollingDelaySecs</span>. If present, it means the
        confirmation can be polled automatically, i.e. without user interaction.
        See{" "}
        <a href="https://docs.yaxi.tech/interrupts.html#_polling">Polling</a>{" "}
        for details.
      </p>
    );
  } else {
    return undefined;
  }
}

export default function FirstResponse({
  service,
  client,
  ticket,
  response,
  onResponse,
}: {
  service: "CollectPayment" | "Transactions";
  client: RoutexClient;
  ticket: string;
  response: OBResponse;
  onResponse: (response: OBResponse) => void;
}) {
  const result = handleResponse(service, client, ticket, response, onResponse);

  return (
    <Flex direction="column">
      <p>
        The app just called{" "}
        <span className="code">
          {service === "Transactions" ? "transactions()" : "collectPayment()"}
        </span>{" "}
        with the credentials you entered in the previous form. The call's result
        is a <span className="code">Response</span>, which is either a{" "}
        <span className="code">Result</span>, a{" "}
        <span className="code">Dialog</span> or a{" "}
        <span className="code">Redirect</span>. For more details see{" "}
        <a href="https://docs.yaxi.tech/interrupts.html" target="_blank">
          Handling interrupts
        </a>
        . In this case, it was a <span className="code">{result.type}</span>.
      </p>
      {result.explanation}
      {result.element}
    </Flex>
  );
}
