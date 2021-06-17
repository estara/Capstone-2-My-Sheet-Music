import React, { useContext } from "react";
import { Navbar, NavbarBrand, Nav, NavItem, NavLink } from "reactstrap";
import { CurrentUserContext } from "./MyMusicContext";
import "./NavBar.css";

function NavBar({ logout }) {
  const currentUser = useContext(CurrentUserContext);

  // display navbar at top of page, provides access to user's library if logged in
  return (
    <div>
      <Navbar color="light" light expand="md">
        <NavbarBrand href="/">My Sheet Music</NavbarBrand>
        <Nav className="mr-auto" navbar>
          <NavItem>
            <NavLink href="/library">Catalog</NavLink>
          </NavItem>
          {currentUser ? (
            <div class="navSelect">
              <NavItem>
                <NavLink href={`/userLib/${currentUser.username}`}>
                  My Library
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/" onClick={logout}>
                  Logout
                </NavLink>
              </NavItem>
            </div>
          ) : (
            <NavItem>
              <NavLink href="/login">Login</NavLink>
            </NavItem>
          )}
        </Nav>
      </Navbar>
    </div>
  );
}

export default NavBar;
