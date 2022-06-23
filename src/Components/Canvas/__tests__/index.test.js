import React from "react";
import { render, screen } from "@testing-library/react";
import Canvas from "../../Canvas";
import { ProvideAuth } from "../../../hooks/useAuth";

// Tests for overall Canvas functionality

describe("Canvas unit", () => {
  test("Smoke test: Renders without errors", () => {
    render(
      <ProvideAuth>
        <Canvas />
      </ProvideAuth>
    );

    screen.debug();
  });
});
