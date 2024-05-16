import {
  Content,
  Divider,
  Flex,
  Heading,
  InlineAlert,
  Button,
  ButtonGroup,
  Text,
} from "@adobe/react-spectrum";
import { ResponseException, RoutexClient } from "routex-client";
import { useEffect, useState } from "react";

export interface ErrorAndTraceId {
  error: Error;
  traceId: undefined | Uint8Array;
}

export default function ResponseError({
  client,
  ticket,
  error,
}: {
  client: RoutexClient;
  ticket: string;
  error: Error | ErrorAndTraceId;
}) {
  let errorObj: Error;
  let traceId: undefined | Uint8Array = undefined;
  if ("traceId" in error) {
    errorObj = error.error;
    traceId = error.traceId;
  } else {
    errorObj = error;
  }
  let [traceDownloadInFlight, setTraceDownloadInFlight] = useState(false);
  let [errorBody, setErrorBody] = useState<string | undefined>(undefined);

  function downloadTrace() {
    setTraceDownloadInFlight(true);
    client
      .trace(ticket, traceId!)
      .then((traceData) => btoa(traceData))
      .then((traceData) => {
        const a = document.createElement("a");
        a.href = "data:application/octet-steam;base64," + traceData;
        const now = new Date();
        a.download = `error-report-${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}.gz.age`;
        a.click();
      })
      .finally(() => setTraceDownloadInFlight(false));
  }

  useEffect(() => {
    async function fetchErrorBody() {
      if (errorObj instanceof ResponseException) {
        setErrorBody(await errorObj.response.text());
      }
    }

    fetchErrorBody();
  }, [errorObj]);

  return (
    <InlineAlert variant="negative">
      <Heading>{errorObj.toString()}</Heading>
      <Content>
        <Flex direction="column">
          {errorObj instanceof ResponseException && (
            <Text>
              HTTP {errorObj.response.status}
              {errorObj.response.statusText
                ? ` (${errorObj.response.statusText})`
                : ""}
              {errorBody ? `: ${errorBody}` : ""}
            </Text>
          )}
          {"errorMessage" in errorObj && (
            <Text>{errorObj.errorMessage as string}</Text>
          )}
          {traceId !== undefined && (
            <>
              <Divider size="S" marginTop="1rem" />
              <Text marginTop="1rem" marginBottom="1rem">
                Most error responses also contain a so-called trace ID. This ID
                can be used to download an encrypted error report. The report
                contains additional debug information which is not stored in
                YAXI's systems for compliance reasons. When you provide the
                error report to YAXI, we can give you additional information
                what went wrong. Note that it potentially contains personally
                identifiable information.
              </Text>
              <ButtonGroup>
                <Button
                  variant="secondary"
                  onPress={downloadTrace}
                  isPending={traceDownloadInFlight}
                >
                  Download error report
                </Button>
              </ButtonGroup>
            </>
          )}
        </Flex>
      </Content>
    </InlineAlert>
  );
}
