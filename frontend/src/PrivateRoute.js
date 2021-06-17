import React, { useContext } from "react";
import { Redirect, Route } from "react-router-dom";
import { CurrentUserContext } from "./MyMusicContext";

function PrivateRoute({ component: Component, ...rest }) {
  const currentUser = useContext(CurrentUserContext);

  // protect restricted routes from access by the wrong person
  return (
    <Route
      {...rest}
      render={(props) =>
        currentUser ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
}

export default PrivateRoute;
