import React from "react";
import { Text } from "react-native";
import { renderRouter, screen, testRouter } from "expo-router/testing-library";

describe("expo-router (smoke)", () => {
  it("renders initial route and navigates via testRouter.push", () => {
    const { getPathname } = renderRouter(
      {
        index: { default: () => <Text>Home Smoke</Text> },
        settings: { default: () => <Text>Settings Smoke</Text> },
      },
      { initialUrl: "/" },
    );

    expect(screen.getByText("Home Smoke")).toBeTruthy();
    expect(getPathname()).toBe("/");

    testRouter.push("/settings");
    expect(screen.getByText("Settings Smoke")).toBeTruthy();
  });
});
