import {
  Accordion,
  Breadcrumbs,
  Button,
  ButtonGroup,
  defaultTheme,
  Disclosure,
  DisclosurePanel,
  DisclosureTitle,
  Header,
  Item,
  Provider,
} from "@adobe/react-spectrum";
import { useEffect, useState } from "react";
import CollectPaymentApp from "./CollectPaymentApp";
import TransactionsApp from "./TransactionsApp";

function restoreStateFromRedirect(
  setService: (service: "CollectPayment" | "Transactions") => void,
  setState: (state: { ticket: string; context: Uint8Array }) => void,
) {
  if (window.location.search.includes("fromRedirect")) {
    let restoredState = window.localStorage.getItem("redirectState");
    if (restoredState) {
      window.localStorage.removeItem("redirectState");
      try {
        const deserialized = JSON.parse(restoredState);
        const ticket = deserialized.ticket as string;
        setState({
          ticket,
          context: new Uint8Array(deserialized.context),
        });
        setService(deserialized.service);
      } catch (error) {
        console.error("Could not deserialize state after redirect", error);
      }
    }
  }
}

function App() {
  let [redirectReturnState, setRedirectReturnState] = useState<
    | {
        ticket: string;
        context: Uint8Array;
      }
    | undefined
  >(undefined);
  let [service, setService] = useState<
    "CollectPayment" | "Transactions" | undefined
  >(undefined);

  useEffect(() => restoreStateFromRedirect(setService, setRedirectReturnState));

  return (
    <Provider theme={defaultTheme} minHeight="100vh">
      {service === "CollectPayment" && (
        <CollectPaymentApp redirectReturnState={redirectReturnState} />
      )}
      {service === "Transactions" && (
        <TransactionsApp redirectReturnState={redirectReturnState} />
      )}
      {service === undefined && (
        <>
          <Header>
            <Breadcrumbs>
              <Item>Start</Item>
            </Breadcrumbs>
          </Header>
          <main>
            <h1>What do you want to do today?</h1>
            <p>
              YAXI provides different services which allow to implement
              different use cases. This app demonstrates a few of them. Please
              select one below.
            </p>
            <Accordion>
              <Disclosure>
                <DisclosureTitle>CollectPayment</DisclosureTitle>
                <DisclosurePanel>
                  <p>
                    The <em>CollectPayment</em> service transfers money from any
                    bank account to another, pre-defined bank account.
                  </p>
                  <ButtonGroup orientation="vertical">
                    <Button
                      variant="primary"
                      onPress={() => setService("CollectPayment")}
                    >
                      Start demo
                    </Button>
                  </ButtonGroup>
                </DisclosurePanel>
              </Disclosure>
              <Disclosure>
                <DisclosureTitle>Transactions</DisclosureTitle>
                <DisclosurePanel>
                  <p>
                    The <em>Transactions</em> service retrieves transactional
                    data from bank accounts and sends it to a pre-defined
                    webhook.
                  </p>
                  <ButtonGroup orientation="vertical">
                    <Button
                      variant="primary"
                      onPress={() => setService("Transactions")}
                    >
                      Start demo
                    </Button>
                  </ButtonGroup>
                </DisclosurePanel>
              </Disclosure>
            </Accordion>
          </main>
        </>
      )}
    </Provider>
  );
}

export default App;
