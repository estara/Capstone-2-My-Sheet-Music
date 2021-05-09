import React, { useEffect, useState, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Button } from 'reactstrap';
import UserLibCard from './UserLibCard';
import MyMusicApi from './api.js';
import { CurrentUserContext } from './MyMusicContext';

function User () {
  const history = useHistory();
  const initialState = {firstName: currentUser.firstName, lastName: currentUser.lastName, email: currentUser.email, password: ""};
  const id = useParams();
  const currentUser = useContext(CurrentUserContext);
  const [formData, setFormData] = useState(initialState);
  const [lib, setLib] = useState(null);

  useEffect(() => {
      async function onLoad() {
          // get user's library
          const userLib = await MyMusicApi.getUserLibrary(id.id);
          setLib(userLib);
      }
      onLoad()
    }, [])

  // handle user form input before submit
  const handleChange = evt => {
    const { name, value } = evt.target;
    setFormData(fData => ({
      ...fData,
      [name]: value
    }));
  }

  // submit updates to user profile
  async function handleSubmit (evt) {
      evt.preventDefault();
      await MyMusicApi.updateUser(id.id, formData);
      setFormData(initialState);
    }

  // delete user upon click
  async function deleteClick (evt) {
    evt.preventDefault();
    await MyMusicApi.deleteUser(id.id);
    history.push('/');
  }
  if (!user) {return <p>Not a valid user.</p>}

  return (
    <div>
        <h3>{currentUser.username}'s Library</h3>
        <form onSubmit={handleSubmit}>
                <label for="name">Name:</label><br/>
                <input type="text" name="name" placeholder={currentUser.name} onChange={handleChange}/><br/>
                <label for="email">Email:</label><br/>
                <input type="text" name="email" placeholder={currentUser.email} onChange={handleChange}/><br/>
                <label for="password">Confirm password to make changes:</label><br/>
                <input type="password" name="password" onChange={handleChange}/><br/>
                <button type="submit">Save Changes</button>
            </form>
        <Button color="danger" onClick={deleteClick} size="sm">Delete User</Button>
        {userLib.map(work => (<UserLibCard work={work}/>))}
    </div>
  )
}

export default User;