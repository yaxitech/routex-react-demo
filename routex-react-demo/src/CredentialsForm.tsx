import {
  Button,
  ButtonGroup,
  Content,
  Flex,
  Form,
  InlineAlert,
  ProgressCircle,
  TextField,
} from "@adobe/react-spectrum";
import {
  ConnectionInfo,
  Credentials,
  CredentialsModel,
  OBResponse,
  RoutexClient,
} from "routex-client";
import { useEffect, useState } from "react";
import ResponseError, { ErrorAndTraceId } from "./ResponseError";

type Requirement = true | false | "if-one-filled";
type FieldInfo = { visible: boolean; required: Requirement };

function determineFields(credentials: undefined | CredentialsModel): {
  userId: FieldInfo;
  password: FieldInfo;
} {
  if (!credentials) {
    return {
      userId: { visible: false, required: false },
      password: { visible: false, required: false },
    };
  }

  return {
    userId: {
      visible: credentials.full || credentials.userId,
      required: credentials.none
        ? credentials.full
          ? "if-one-filled"
          : false
        : true,
    },
    password: {
      visible: credentials.full,
      required: credentials.full
        ? credentials.none
          ? "if-one-filled"
          : !credentials.userId
        : false,
    },
  };
}

export default function CredentialsForm({
  service,
  client,
  ticket,
  connectionId,
  initiateService,
  onCancel,
  onResponse,
}: {
  service: "CollectPayment" | "Transactions";
  client: RoutexClient;
  ticket: string;
  connectionId: string;
  initiateService: (credentials: Credentials) => Promise<OBResponse>;
  onCancel: () => void;
  onResponse: (response: OBResponse) => void;
}) {
  let [connection, setConnection] = useState<null | ConnectionInfo>(null);
  let [error, setError] = useState<null | ErrorAndTraceId>(null);
  let [requestInFlight, setRequestInFlight] = useState(false);
  let [userId, setUserId] = useState<string>("");
  let [password, setPassword] = useState<string>("");

  let fields = determineFields(connection?.credentials);

  useEffect(() => {
    client.info(ticket, connectionId).then(
      (c) => setConnection(c),
      (error) => setError({ error, traceId: client.traceId() }),
    );
  }, [connectionId]);

  function buildCredentials(): Credentials {
    const credentials: Credentials = {
      connectionId,
    };
    if (
      fields.userId.required === true ||
      (fields.userId.required === "if-one-filled" && password.length > 0)
    ) {
      credentials.userId = userId;
    }
    if (
      fields.password.required === true ||
      (fields.password.required === "if-one-filled" && userId.length > 0)
    ) {
      credentials.password = password;
    }
    return credentials;
  }

  function execLogin() {
    setRequestInFlight(true);
    initiateService(buildCredentials())
      .then(onResponse, (error) =>
        setError({ error, traceId: client.traceId() }),
      )
      .finally(() => setRequestInFlight(false));
  }

  return (
    <Flex direction="column">
      <p>
        The next step is then a login page where a user enters their banking
        credentials. This depends on the connection, so a connection information
        returned by the client's <span className="code">search</span> or{" "}
        <span className="code">info</span> methods also returns details on the
        credential model via the
        <span className="code">credentials</span> property. Please see the
        property's documentation and{" "}
        <a href="https://docs.yaxi.tech/credentials.html" target="_blank">
          Providing Credentials
        </a>{" "}
        for more details.
      </p>
      <p>
        The credentials are then used to start a service. There are different
        services available:{" "}
        <a href="https://docs.yaxi.tech/accounts.html" target="_blank">
          <span className="code">Accounts</span>
        </a>
        ,
        <a href="https://docs.yaxi.tech/collect-payment.html" target="_blank">
          <span className="code">CollectPayment</span>
        </a>{" "}
        and
        <span className="code">Transactions</span>. To start a service, call the
        corresponding
        <span className="code">RoutexClient</span> method. This demo focuses on
        {service === "Transactions" ? " transactions" : " CollectPayment"}, so
        <span className="code">
          {service === "Transactions"
            ? "client.transactions()"
            : "client.collectPayment()"}
        </span>{" "}
        is used.
      </p>
      {service === "CollectPayment" && (
        <p>
          You can also pass an <span className="code">account</span> argument to{" "}
          <span className="code">collectPayment</span> (not done in this demo),
          for example when a user used this connection before and your app asked
          whether to remember the connection. This potentially avoids an account
          selection screen.
        </p>
      )}
      {connection ? (
        <Form
          validationBehavior="native"
          onSubmit={(e) => {
            e.preventDefault();
            execLogin();
          }}
        >
          <>
            {fields.userId.visible && (
              <TextField
                label={connection.userId ?? "User ID"}
                isRequired={
                  fields.userId.required === true ||
                  (fields.userId.required === "if-one-filled" &&
                    (password.length > 0 || userId.length > 0))
                }
                value={userId}
                onChange={setUserId}
                description={
                  fields.userId.required === "if-one-filled" &&
                  "You can leave this field empty or you need to fill this field and the one below."
                }
              />
            )}
          </>
          <>
            {fields.password.visible && (
              <TextField
                type="password"
                label="Password"
                isRequired={
                  fields.password.required === true ||
                  (fields.password.required === "if-one-filled" &&
                    (password.length > 0 || userId.length > 0))
                }
                value={password}
                onChange={setPassword}
              />
            )}
          </>
          <>
            {connection.advice && (
              <InlineAlert>
                <Content>{connection.advice}</Content>
              </InlineAlert>
            )}
          </>
          <>
            {error && (
              <ResponseError client={client} ticket={ticket} error={error} />
            )}
          </>
          <ButtonGroup>
            <Button type="submit" variant="primary" isPending={requestInFlight}>
              Login
            </Button>
            <Button variant="secondary" onPress={onCancel}>
              Select different bank
            </Button>
          </ButtonGroup>
        </Form>
      ) : error ? (
        <ResponseError client={client} ticket={ticket} error={error} />
      ) : (
        <ProgressCircle aria-label="Loading" isIndeterminate />
      )}
    </Flex>
  );
}
