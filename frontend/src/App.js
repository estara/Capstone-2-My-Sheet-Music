import React, { useState, useEffect } from 'react';
import './App.css';
import { CurrentUserContext, CurrentUserDispatchContext, LibraryContext, LibraryDispatchContext,  UserLibContext, UserLibDispatchContext } from './MyMusicContext';
import MyMusicApi from './api.js';
import Routes from './Routes';

function App() {
  // create states for needed information
  const [currentUser, setCurrentUser] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [library, setLibrary] = useState();
  const [userLib, setUserLib] = useState([]);
  
  // get needed information on load if user is stored in localstorage
  useEffect(() => {
    async function onLoad() {
      try{
      const token = localStorage.getItem('token');
      console.log(token)
      MyMusicApi.token = token;
      const username = localStorage.getItem('username');
      const user = await MyMusicApi.getUser(username);
      setCurrentUser({token: token, id: user.user.id, username: username, name: user.user.name, email: user.user.email});
      const libraryList = await MyMusicApi.getLibrary();
      setLibrary(libraryList.library);
      
      if (user.user.works) {
        try{
      const userLibList = await MyMusicApi.getUserLib(user.user.id);
      setUserLib(userLibList.library);
        }catch(err) {}
      }
      setIsLoading(false);
      } catch (err) {
        const libraryList = await MyMusicApi.getLibrary();
        setLibrary(libraryList.library);
        setIsLoading(false);
        setCurrentUser(false);
      }
    }
    onLoad();
  }, [isLoading]);

  // login user
  async function login(formData) {
    const res = await MyMusicApi.login(formData);
    setCurrentUser({token: res, username: formData.username});
    localStorage.setItem('token', res);
    localStorage.setItem('username', formData.username)
    setIsLoading(true);
    return formData.username
  }

  // logout user
  async function logout() {
    await MyMusicApi.logout();
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }

  // register new user
  async function signup (formData) {
    const res = await MyMusicApi.signup(formData);
    localStorage.setItem('token', res);
    localStorage.setItem('username', formData.username);
    setIsLoading(true);
    return formData.username
  }

  

  // display loading message while loading
  if (isLoading) {
    return <p>Loading &hellip;</p>;
  }

  // send info into context and render routes
  return (
    <div className="App">
      <CurrentUserContext.Provider value={currentUser}>
      <CurrentUserDispatchContext.Provider value={setCurrentUser}>
      <LibraryContext.Provider value={library}>
      <LibraryDispatchContext.Provider value={setLibrary}>
      <UserLibContext.Provider value={userLib}>
      <UserLibDispatchContext.Provider value={setUserLib}>
          <Routes logout={logout} login={login} signup={signup}/>
      </UserLibDispatchContext.Provider>
      </UserLibContext.Provider>
      </LibraryDispatchContext.Provider>
      </LibraryContext.Provider>
      </CurrentUserDispatchContext.Provider>
      </CurrentUserContext.Provider>
    </div>
  );
}

export default App;
