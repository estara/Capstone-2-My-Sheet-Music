import React from 'react';
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Home from './Home';
import Library from './Library';
import NavBar from './NavBar';
import User from './User';
import Login from './Login';
import Signup from './Signup';
import AddWork from './AddWork';

function Routes ({ logout, login, signup }) {

    // routes for app
    return (
        <div className="Routes">
          <BrowserRouter>
            <NavBar logout={logout}/>
            <main>
              <Switch>
                <Route exact path="/">
                  <Home />
                </Route>
                <PrivateRoute exact path="/newWork" component={AddWork}/>
                <PrivateRoute exact path="/userLib/:id" component={User}/>
                <Route exact path="/login">
                  <Login login={login}/>
                </Route>
                <Route exact path="/library">
                  <Library/>
                </Route>
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