export async function issueTicket(
  service: "CollectPayment" | "Transactions",
  ticketData: Record<string, any>,
): Promise<string> {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/ticket?service=${service}`,
    {
      method: "POST",
      body: JSON.stringify(ticketData),
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    },
  );
  if (response.status >= 200 && response.status < 300) {
    return response.json();
  } else {
    throw `Ticket endpoint returned unexpected status ${response.status}`;
  }
}
