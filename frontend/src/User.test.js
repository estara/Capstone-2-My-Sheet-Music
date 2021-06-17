import React from "react";
import { render } from "@testing-library/react";
import User from "./User";

it("renders without crashing", function () {
  render(<User />);
});

it("matches snapshot", function () {
  const { asFragment } = render(<User />);
  expect(asFragment()).toMatchSnapshot();
});
