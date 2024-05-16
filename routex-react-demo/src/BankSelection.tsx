import { InlineAlert, Item, Menu, SearchField } from "@adobe/react-spectrum";
import { useEffect, useState } from "react";
import { ConnectionInfo, RoutexClient, SearchFilter } from "routex-client";
import ResponseError, { ErrorAndTraceId } from "./ResponseError.js";

const SEARCH_LIMIT = 50;
const MIN_SEARCH_INPUT_LENGTH = 3;

export default function BankSelection({
  client,
  ticket,
  selected,
}: {
  client: RoutexClient;
  ticket: string;
  selected: (connectionId: string) => void;
}) {
  let [searchValue, setSearchValue] = useState("");
  let [searchResults, setSearchResults] = useState<null | ConnectionInfo[]>(
    null,
  );
  let [error, setError] = useState<null | ErrorAndTraceId>(null);

  const firstWordLower = searchValue.split(/\s+/)[0].toLowerCase();

  function compareInfos(a: ConnectionInfo, b: ConnectionInfo): number {
    const dispA = a.displayName.toLowerCase();
    const dispB = b.displayName.toLowerCase();

    const idxA = dispA.indexOf(firstWordLower);
    const idxB = dispB.indexOf(firstWordLower);

    if (idxA == -1 && idxB == -1) {
      if (dispA === dispB) {
        return 0;
      } else if (dispA < dispB) {
        return -1;
      } else {
        return 1;
      }
    } else if (idxA >= 0 && idxB >= 0) {
      return idxA - idxB;
    } else if (idxA >= 0) {
      return -1;
    } else {
      return 1;
    }
  }

  useEffect(() => {
    if (searchValue.length < MIN_SEARCH_INPUT_LENGTH) {
      setSearchResults(null);
      return;
    }

    let ignore = false;

    // Splitting the search input on spaces leads to better results when the
    // user only enters partial words or if there is another word in-between
    const filters: SearchFilter[] = searchValue.split(/\s+/).map((term) => {
      return { term };
    });

    // TODO debounce search
    client
      .search({
        ticket,
        filters,
        ibanDetection: true,
        limit: SEARCH_LIMIT,
      })
      .then(
        (results) => {
          if (ignore) return;
          results.sort(compareInfos);
          if (results.length == SEARCH_LIMIT) {
            results[results.length - 1].displayName = "...";
          }
          setSearchResults(results);
        },
        (error) => setError({ error, traceId: client.traceId() }),
      );

    return () => {
      ignore = true;
    };
  }, [searchValue]);

  // TODO handle no results

  return (
    <>
      <SearchField
        label="Bank name, bank code or IBAN"
        width="100%"
        onChange={setSearchValue}
        value={searchValue}
        description={
          searchValue.length > 0 &&
          searchValue.length < MIN_SEARCH_INPUT_LENGTH &&
          `Enter at least ${MIN_SEARCH_INPUT_LENGTH} characters to start search`
        }
      />
      {error !== null && (
        <ResponseError client={client} ticket={ticket} error={error} />
      )}
      {searchResults !== null && searchResults.length > 0 && (
        <Menu
          onAction={(key) => selected(key as string)}
          aria-label="Search results"
          items={searchResults}
        >
          {(conn) => <Item key={conn.id}>{conn.displayName}</Item>}
        </Menu>
      )}
      {searchResults?.length === 0 && (
        <InlineAlert variant="neutral">
          Search didn't match any results
        </InlineAlert>
      )}
    </>
  );
}
