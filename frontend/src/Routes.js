import React from 'react';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Home from './Home';
import Admin from './Library';
import NavBar from './NavBar';
import User from './User';
import Login from './Login';
import Signup from './Signup';

function Routes ({ logout, login, signup }) {

    return (
        <div className="Routes">
          <BrowserRouter>
            <NavBar logout={logout}/>
            <main>
              <Switch>
                <Route exact path="/">
                  <Home />
                </Route>
                
                <PrivateRoute exact path="/userLib/:id" component={User}/>
                <Route exact path="/login">
                  <Login login={login}/>
                </Route>
                <Route exact path="/library">
                  <Catalog/>
                </Route>
                <PrivateRoute exact path="/admin" component={Admin}/>
                <Route exact path="/signup">
                  <Signup signup={signup}/>
                </Route>
                <Route>
                  <p>Hmmm. I can't seem to find what you want.</p>
                </Route>
              </Switch>
            </main>
          </BrowserRouter>
        </div>
      );
}

export default Routes;