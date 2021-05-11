import React, { useState } from 'react';
import { Form, Input, Button } from 'reactstrap';
import { useHistory } from 'react-router-dom';
import MyMusicApi from './api.js';

function AddWork () {
    const initialState = {title: "", composer: "", genre: "", birth: "", epoch: "", popular: false}
    const [formData, setFormData] = useState(initialState)
    const history = useHistory();

    // handle user form input before submit
    const handleChange = evt => {
        const { name, value } = evt.target;
        setFormData(fData => ({
          ...fData,
          [name]: value
        }));
    }
    
    // handle form submission
    async function handleSubmit (evt) {
        evt.preventDefault();
        await MyMusicApi.addWork(formData);
        setFormData(initialState);
        history.push('/library')
    }

    // display page for adding new work to library
    return (
        <div>
            <h1>Add a piece</h1>
            <Form onSubmit={handleSubmit}>
                <Input type="text" name="title" placeholder="Title" onChange={handleChange} required/><br/><br/>
                <Input type="text" name="composer" placeholder="Composer" onChange={handleChange} required/><br/><br/>
                <Input type="text" name="genre" placeholder="What type of composition?" onChange={handleChange} /><br/><br/>
                <Input type="text" name="birth" placeholder="Composer birthdate" onChange={handleChange} /><br/><br/>
                <Input type="text" name="epoch" placeholder="Era" onChange={handleChange} /><br/><br/>
                <Button type="submit">Submit</Button>
            </Form>
        </div>
    )
}

export default AddWork;