import { useState } from "react";
import { Breadcrumbs, Flex, Header, Item } from "@adobe/react-spectrum";
import BankSelection from "./BankSelection";
import TicketForm from "./collect-payment/TicketForm";
import { OBResponse, RoutexClient } from "routex-client";
import CredentialsForm from "./CredentialsForm";
import FirstResponse from "./FirstResponse";
import ConsecutiveResponse from "./ConsecutiveResponse";
import ReturnedFromRedirect from "./ReturnedFromRedirect";

const client = new RoutexClient(new URL(import.meta.env.VITE_ROUTEX_URL));

type State =
  | { state: "Initial" }
  | { state: "TicketIssued"; ticket: string }
  | { state: "ConnectionSelected"; ticket: string; connectionId: string }
  | { state: "CollectPaymentInitiated"; ticket: string; response: OBResponse }
  | {
      state: "ResponseReceived";
      ticket: string;
      response: OBResponse;
      responseCount: number;
    }
  | { state: "ReturnedFromRedirect"; ticket: string; context: Uint8Array };

function CollectPaymentApp({
  redirectReturnState,
}: {
  redirectReturnState?: { ticket: string; context: Uint8Array };
}) {
  let [state, setState] = useState<State>(
    redirectReturnState
      ? {
          state: "ReturnedFromRedirect",
          ...redirectReturnState,
        }
      : { state: "Initial" },
  );

  return (
    <>
      <Header>
        <Breadcrumbs>
          <Item href="/">Start</Item>
          <Item>Collect Payment</Item>
        </Breadcrumbs>
      </Header>
      <main>
        <h1>Collect Payment</h1>
        {state.state === "Initial" && (
          <TicketForm
            onDone={(ticket) => setState({ state: "TicketIssued", ticket })}
          />
        )}
        {state.state === "TicketIssued" && (
          <Flex direction="column">
            <p>
              Before you can instantiate the <em>Collect Payment</em> service,
              you need to know the bank that the user wants to use for the money
              transfer. YAXI offers a search endpoint that returns results based
              on a bank name, an IBAN or a bank code. You can use it in your app
              via <span className="code">RoutexClient</span>'s
              <span className="code">search()</span> method.
            </p>
            <BankSelection
              client={client}
              ticket={state.ticket}
              selected={(id) =>
                setState({
                  state: "ConnectionSelected",
                  ticket: state.ticket,
                  connectionId: id,
                })
              }
            />
          </Flex>
        )}
        {state.state === "ConnectionSelected" && (
          <CredentialsForm
            client={client}
            ticket={state.ticket}
            connectionId={state.connectionId}
            initiateService={(credentials) =>
              client.collectPayment({
                credentials,
                session: undefined,
                ticket: state.ticket,
                account: undefined,
              })
            }
            service="CollectPayment"
            onCancel={() =>
              setState({
                state: "TicketIssued",
                ticket: state.ticket,
              })
            }
            onResponse={(response) =>
              setState({
                state: "CollectPaymentInitiated",
                ticket: state.ticket,
                response,
              })
            }
          />
        )}
        {state.state === "CollectPaymentInitiated" && (
          <FirstResponse
            service="CollectPayment"
            client={client}
            ticket={state.ticket}
            response={state.response}
            onResponse={(response) =>
              setState({
                state: "ResponseReceived",
                ticket: state.ticket,
                response: response,
                responseCount: 1,
              })
            }
          />
        )}
        {state.state === "ResponseReceived" && (
          <ConsecutiveResponse
            key={state.responseCount}
            service="CollectPayment"
            client={client}
            ticket={state.ticket}
            response={state.response}
            onResponse={(response) =>
              setState({
                state: "ResponseReceived",
                ticket: state.ticket,
                response: response,
                responseCount: state.responseCount + 1,
              })
            }
            onStartAgain={() => setState({ state: "Initial" })}
          />
        )}
        {state.state == "ReturnedFromRedirect" && (
          <ReturnedFromRedirect
            service="CollectPayment"
            client={client}
            ticket={state.ticket}
            context={state.context}
            onResponse={(response) =>
              setState({
                state: "ResponseReceived",
                ticket: state.ticket,
                response,
                responseCount: 1,
              })
            }
          />
        )}
      </main>
    </>
  );
}

export default CollectPaymentApp;
