import BankSelection from "./BankSelection";
import { Breadcrumbs, Flex, Header, Item } from "@adobe/react-spectrum";
import { OBResponse, RoutexClient } from "routex-client";
import { useState } from "react";
import CredentialsForm from "./CredentialsForm";
import FirstResponse from "./FirstResponse";
import ConsecutiveResponse from "./ConsecutiveResponse";
import ReturnedFromRedirect from "./ReturnedFromRedirect";
import TicketForm from "./transactions/TicketForm";

const client = new RoutexClient(new URL(import.meta.env.VITE_ROUTEX_URL));

type State =
  | { state: "Initial" }
  | { state: "TicketIssued"; ticket: string }
  | { state: "ConnectionSelected"; ticket: string; connectionId: string }
  | { state: "TransactionsRequested"; ticket: string; response: OBResponse }
  | {
      state: "ResponseReceived";
      ticket: string;
      response: OBResponse;
      responseCount: number;
    }
  | { state: "ReturnedFromRedirect"; ticket: string; context: Uint8Array };

function TransactionsApp({
  redirectReturnState,
}: {
  redirectReturnState?: { ticket: string; context: Uint8Array };
}) {
  let [state, setState] = useState<State>(
    redirectReturnState
      ? { state: "ReturnedFromRedirect", ...redirectReturnState }
      : { state: "Initial" },
  );

  return (
    <>
      <Header>
        <Breadcrumbs>
          <Item href="/">Start</Item>
          <Item>Transactions Demo</Item>
        </Breadcrumbs>
      </Header>
      <main>
        <h1>Transactions Demo</h1>
        <a href="https://docs.yaxi.tech/getting-started.html" target="_blank">
          Link to docs
        </a>
        {state.state === "Initial" && (
          <TicketForm
            onDone={(ticket) => setState({ state: "TicketIssued", ticket })}
          />
        )}
        {state.state == "TicketIssued" && (
          <Flex direction="column">
            <p>
              Before you can instantiate the <em>Transaction</em> service, you
              need a <em>connection ID</em> (i.e. the bank you want to connect
              to). YAXI offers a search endpoint that returns results based on a
              bank name, an IBAN or a bank code. You can use it in your app via{" "}
              <span className="code">RoutexClient</span>'s{" "}
              <span className="code">search()</span> method.
            </p>
            <BankSelection
              client={client}
              ticket={state.ticket}
              selected={(connectionId) =>
                setState({
                  state: "ConnectionSelected",
                  ticket: state.ticket,
                  connectionId,
                })
              }
            />
          </Flex>
        )}
        {state.state == "ConnectionSelected" && (
          <CredentialsForm
            service="Transactions"
            client={client}
            ticket={state.ticket}
            connectionId={state.connectionId}
            initiateService={(credentials) =>
              client.transactions({ credentials, ticket: state.ticket })
            }
            onCancel={() =>
              setState({ state: "TicketIssued", ticket: state.ticket })
            }
            onResponse={(response) =>
              setState({
                state: "TransactionsRequested",
                ticket: state.ticket,
                response,
              })
            }
          />
        )}
        {state.state == "TransactionsRequested" && (
          <FirstResponse
            service="Transactions"
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
        {state.state == "ResponseReceived" && (
          <ConsecutiveResponse
            key={state.responseCount}
            service="Transactions"
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
            service="Transactions"
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

export default TransactionsApp;
