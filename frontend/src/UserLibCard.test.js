import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import UserLibCard from "./UserLibCard";

it("renders without crashing", function () {
  render(
    <MemoryRouter>
      <UserLibCard />
    </MemoryRouter>
  );
});

it("matches snapshot", function () {
  const { asFragment } = render(
    <MemoryRouter>
      <UserLibCard />
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});
