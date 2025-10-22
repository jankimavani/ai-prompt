import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";

// Mock API call (so it doesn't hit your real backend)
beforeAll(() => {
  global.fetch = vi.fn(async () => ({
    ok: true,
    json: async () => ({
      message: { role: "assistant", content: "Hello how are" },
    }),
  }));
});
afterAll(() => {
  global.fetch.mockRestore?.();
});

test("submits a prompt and shows AI reply", async () => {
  render(<App />);

  const input = screen.getByPlaceholderText(/ask something/i);
  const button = screen.getByRole("button", { name: /send/i });

  fireEvent.change(input, { target: { value: "Say hi" } });
  fireEvent.click(button);

  // Wait for assistant message to appear
  await waitFor(() => expect(screen.getByText("AI:")).toBeInTheDocument());

  // Check that AI reply appears
  expect(screen.getByText("Hello how are")).toBeInTheDocument();
});
