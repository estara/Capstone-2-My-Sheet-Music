import React, { useContext, useState } from 'react';
import LibCard from './LibCard';
import './Library.css';
import MyMusicApi from './api.js';
import { LibraryContext, LibraryDispatchContext } from './MyMusicContext';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';


function Library() {
    const [formData, setFormData] = useState({});
    const library = useContext(LibraryContext);
    const setLibrary = useContext(LibraryDispatchContext);

    // handle user changing search form
    const handleChange = evt => {
        const { name, value } = evt.target;
        setFormData(fData => ({
          ...fData,
          [name]: value
        }));
    }
    
    // handle search form submission
    async function handleSubmit (evt) {
        evt.preventDefault();
        if (!formData) {return};
        const newWorks = await MyMusicApi.getLibrary(formData);
        setLibrary(newWorks.library);
        setFormData({});
    }

    // display library catalog
    return (
        <div>
            <h2>Check out our sheet music library!</h2>
            <p>Don't see a piece you'd like in your library?<br/>
            <a href='/newWork'>Add it to our library.</a></p>
            <p>For the most results search by composer or title.</p>
            <Form inline onSubmit={handleSubmit}>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label for="composer" className="mr-sm-2">Composer Name </Label>
                <Input type="text" name="composer" id="composer" onChange={handleChange}/>
            </FormGroup>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label for="title" className="mr-sm-2"> Title </Label>
                <Input type="text" name="title" id="title" onChange={handleChange}/>
            </FormGroup>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label for="epoch" className="mr-sm-2"> Era </Label>
                <Input type="text" name="epoch" id="epoch" onChange={handleChange}/>
            </FormGroup>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label for="genre" className="mr-sm-2"> Type of composition </Label>
                <Input type="text" name="genre" id="genre" onChange={handleChange}/>
            </FormGroup>
            <Button>Filter</Button>
        </Form> <br/>


            {library.map(piece => (<LibCard piece={piece}/>))}
        </div>
    )
}

export default Library;