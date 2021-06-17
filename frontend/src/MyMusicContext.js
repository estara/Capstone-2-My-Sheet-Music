import React from "react";

// create contexts
const CurrentUserContext = React.createContext();
const CurrentUserDispatchContext = React.createContext();
const LibraryContext = React.createContext();
const LibraryDispatchContext = React.createContext();
const UserLibContext = React.createContext();
const UserLibDispatchContext = React.createContext();

export {
  CurrentUserContext,
  CurrentUserDispatchContext,
  LibraryContext,
  LibraryDispatchContext,
  UserLibContext,
  UserLibDispatchContext,
};
