import React from "react";
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import Canvas from "../../Canvas";
import { ProvideAuth } from "../../../hooks/useAuth";

// Tests for overall Canvas functionality

describe("Canvas unit", () => {
  test("Smoke test: Renders without errors", async () => {
    await act(async () => {
      render(
        <ProvideAuth>
          <Canvas />
        </ProvideAuth>
      );
    });

    screen.debug();
  });
});
