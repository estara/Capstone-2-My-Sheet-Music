import React, { useContext } from 'react';
import LibCard from './LibCard';
import { LibraryContext } from './MyMusicContext';


function Library() {
    const [formData, setFormData] = useState({});
    const {library} = useContext(LibraryContext);
    const setLibrary = useContext(LibraryDispatchContext);

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
        setLibrary(newWorks);
        setFormData({});
    }

    // display list of users
    return (
        <div>
            <h2>Check out our sheet music library!</h2>
            <p>Don't see a piece you'd like in your library?</p>
            <a href='/newWork'>Add it to our library.</a>
            <Form inline onSubmit={handleSubmit}>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label for="composer" className="mr-sm-2">Composer Name</Label>
                <Input type="text" name="composer" id="composer" onChange={handleChange}/>
            </FormGroup>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label for="title" className="mr-sm-2">Title</Label>
                <Input type="text" name="title" id="title" onChange={handleChange}/>
            </FormGroup>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label for="epoch" className="mr-sm-2">Era</Label>
                <Input type="text" name="epoch" id="epoch" onChange={handleChange}/>
            </FormGroup>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                <Label for="genre" className="mr-sm-2">Type of composition</Label>
                <Input type="text" name="genre" id="genre" onChange={handleChange}/>
            </FormGroup>
            <FormGroup check>
                <Label check>
                <Input type="checkbox" />{' '}
                        Popular works
                </Label>
            </FormGroup>
            <Button>Filter</Button>
        </Form> <br/>


            {library.map(work => (<LibCard work={work}/>))}
        </div>
    )
}

export default Library;