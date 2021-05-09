import React, { useState, useEffect } from 'react';
import './App.css';
import { CurrentUserContext, CurrentUserDispatchContext, HasAppliedToJobContext, HasAppliedToJobDispatchContext, CompaniesDispatchContext, CompaniesContext, JobsContext, JobsDispatchContext } from './JoblyContext';
import MyMusicApi from './api.js';
import Routes from './Routes';

function App() {
  // create states for needed information
  const [currentUser, setCurrentUser] = useState('foob');
  const [hasAppliedToJob, setHasAppliedToJob] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState(null);
  const [jobs, setJobs] = useState(null);
  
  // get needed information on load if user is stored in localstorage
  useEffect(() => {
    async function onLoad() {
      try{
      const token = localStorage.getItem('token');
      MyMusicApi.token = token;
      const username = localStorage.getItem('username');
      const companyList = await MyMusicApi.getCompanies();
      const user = await MyMusicApi.getUser(username);
      const jobList = await MyMusicApi.getJobs();
      if (user.applications) {setHasAppliedToJob(user.applications);}
      setCompanies(companyList);
      setJobs(jobList);
      setCurrentUser({token: token, username: username, firstName: user.firstName, lastName: user.lastName, email: user.email});
      setIsLoading(false);
      } catch (err) {
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
      <HasAppliedToJobContext.Provider value={hasAppliedToJob}>
      <HasAppliedToJobDispatchContext.Provider value={setHasAppliedToJob}>
      <CompaniesContext.Provider value={companies}>
      <CompaniesDispatchContext.Provider value={setCompanies}>
      <JobsContext.Provider value={jobs}>
      <JobsDispatchContext.Provider value={setJobs}>
          <Routes logout={logout} login={login} signup={signup}/>
      </JobsDispatchContext.Provider>
      </JobsContext.Provider>
      </CompaniesDispatchContext.Provider>
      </CompaniesContext.Provider>
      </HasAppliedToJobDispatchContext.Provider>
      </HasAppliedToJobContext.Provider>
      </CurrentUserDispatchContext.Provider>
      </CurrentUserContext.Provider>
    </div>
  );
}

export default App;
