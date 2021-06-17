import React, { useContext, useState } from "react";
import LibCard from "./LibCard";
import MyMusicApi from "./api.js";
import { LibraryContext, LibraryDispatchContext } from "./MyMusicContext";
import { Form, FormGroup, Label, Input, Button, Container } from "reactstrap";

function Library() {
  const [formData, setFormData] = useState({});
  const library = useContext(LibraryContext);
  const setLibrary = useContext(LibraryDispatchContext);

  // handle user changing search form
  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((fData) => ({
      ...fData,
      [name]: value,
    }));
  };

  // handle search form submission
  async function handleSubmit(evt) {
    evt.preventDefault();
    if (!formData) {
      return;
    }
    const newWorks = await MyMusicApi.getLibrary(formData);
    setLibrary(newWorks.library);
    setFormData({});
  }

  // display library catalog
  return (
    <div class="library">
      <h2>Check out our sheet music library!</h2>
      <p>
        Don't see a piece you'd like in your library?
        <br />
        <a href="/newWork">Add it to our library.</a>
      </p>
      <p>For the most results search by composer or title.</p>
      <div class="searchForm">
        <Form onSubmit={handleSubmit}>
          <label for="composer">Composer Name</label>
          <input
            type="text"
            name="composer"
            id="composer"
            onChange={handleChange}
          />
          <label for="title">Title</label>
          <input type="text" name="title" id="title" onChange={handleChange} />
          <label for="epoch">Era</label>
          <input type="text" name="epoch" id="epoch" onChange={handleChange} />
          <label for="genre">Type of composition</label>
          <input type="text" name="genre" id="genre" onChange={handleChange} />
          <Button>Filter</Button>
        </Form>
      </div>
      <div
        id="mainContent"
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gridGap: "2vw",
          gridAutoRows: "minMax(100px, auto)",
        }}
      >
        {library.map((piece) => (
          <div>
            <LibCard piece={piece} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Library;
