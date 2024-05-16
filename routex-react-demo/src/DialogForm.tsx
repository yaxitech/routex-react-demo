import {
  Button,
  ButtonGroup,
  Content,
  Form,
  Image as SpectrumImage,
  InlineAlert,
  Item,
  Menu,
  ProgressCircle,
  Section,
  Text,
  TextField,
} from "@adobe/react-spectrum";
import {
  Dialog,
  OBResponse,
  RoutexClient,
  Selection,
  Field,
  Image,
  Confirmation,
  SecrecyLevel,
  InputType,
} from "routex-client";
import { useEffect, useState } from "react";
import ResponseError, { ErrorAndTraceId } from "./ResponseError";

function SelectionElement({
  input,
  onSelectionChange,
}: {
  input: Selection;
  onSelectionChange: (selection: string) => void;
}) {
  return (
    <Menu
      selectionMode="single"
      onSelectionChange={(selection) =>
        onSelectionChange((selection as Set<string>).values().next().value!)
      }
    >
      <Section items={input.options}>
        {(opt) => (
          <Item key={opt.key} textValue={opt.label}>
            <Text>{opt.label}</Text>
            {opt.explanation && (
              <Text slot="description">{opt.explanation}</Text>
            )}
          </Item>
        )}
      </Section>
    </Menu>
  );
}

function FieldElement({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: undefined | string;
  onChange: (value: string) => void;
}) {
  function determineType():
    | "date"
    | "email"
    | "number"
    | "phone"
    | "password"
    | "text" {
    if (field.secrecyLevel === SecrecyLevel.Password) {
      return "password";
    } else {
      switch (field.type) {
        case InputType.Date:
          return "date";
        case InputType.Email:
          return "email";
        case InputType.Number:
          return "number";
        case InputType.Phone:
          return "phone";
        case InputType.Text:
          return "text";
      }
    }
  }

  return (
    <TextField
      type={determineType()}
      minLength={field.minLength}
      maxLength={field.maxLength}
      value={value}
      onChange={onChange}
    />
  );
}

function InlineImage({ image }: { image: Image }) {
  let [base64Url, setBase64Url] = useState<null | string>(null);

  useEffect(() => {
    const base64url = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(
        new Blob([new Uint8Array(image.data)], { type: image.mimeType }),
      );
    });
    base64url.then((url) => setBase64Url(url));
  }, [image.data]);

  if (base64Url !== null) {
    return <SpectrumImage src={base64Url} />;
  } else {
    return <ProgressCircle aria-label="Loading image" />;
  }
}

export default function DialogForm({
  service,
  client,
  ticket,
  dialog,
  showContinueHint = false,
  onResponse,
}: {
  service: "CollectPayment" | "Transactions";
  client: RoutexClient;
  ticket: string;
  dialog: Dialog;
  showContinueHint?: boolean;
  onResponse: (response: OBResponse) => void;
}) {
  let [error, setError] = useState<null | ErrorAndTraceId>(null);
  let [dialogResponse, setDialogResponse] = useState<
    undefined | "confirmation" | { response: string }
  >(dialog.input instanceof Confirmation ? "confirmation" : undefined);
  let [requestInFlight, setRequestInFlight] = useState(false);

  function primaryLabel(): string {
    if (dialog.input instanceof Confirmation) {
      return "Confirm";
    } else {
      return "Continue";
    }
  }

  function respond() {
    setRequestInFlight(true);
    let responsePromise;
    if (dialogResponse === "confirmation") {
      responsePromise = client[
        service === "CollectPayment"
          ? "confirmCollectPayment"
          : "confirmTransactions"
      ]({
        ticket,
        context: dialog.input.context,
      });
    } else {
      responsePromise = client[
        service === "CollectPayment"
          ? "respondCollectPayment"
          : "respondTransactions"
      ]({
        ticket,
        context: dialog.input.context,
        response: dialogResponse!.response,
      });
    }
    responsePromise
      .then(onResponse, (error) =>
        setError({ error, traceId: client.traceId() }),
      )
      .finally(() => setRequestInFlight(false));
  }

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        respond();
      }}
    >
      <>{dialog.message && <Text>{dialog.message}</Text>}</>
      <>{dialog.image && <InlineImage image={dialog.image} />}</>
      <>
        {dialog.input instanceof Selection && (
          <SelectionElement
            input={dialog.input}
            onSelectionChange={(selection) =>
              setDialogResponse({ response: selection })
            }
          />
        )}
      </>
      <>
        {dialog.input instanceof Field && (
          <FieldElement
            field={dialog.input}
            value={
              dialogResponse !== "confirmation" ? dialogResponse?.response : ""
            }
            onChange={(value) => setDialogResponse({ response: value })}
          />
        )}
      </>
      <>
        {error && (
          <ResponseError client={client} ticket={ticket} error={error} />
        )}
      </>
      <>
        {showContinueHint && (
          <InlineAlert variant="info">
            <Content>
              Note that dialogs can only be continued. It is not possible to go
              back to a previous step.
            </Content>
          </InlineAlert>
        )}
      </>
      <ButtonGroup>
        <Button
          type="submit"
          variant="primary"
          isDisabled={dialogResponse === undefined}
          isPending={requestInFlight}
        >
          {primaryLabel()}
        </Button>
      </ButtonGroup>
    </Form>
  );
}
