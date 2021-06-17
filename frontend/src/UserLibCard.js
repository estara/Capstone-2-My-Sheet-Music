import React, { useState, useContext } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  Button,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import MyMusicApi from "./api.js";
import { CurrentUserContext } from "./MyMusicContext";

function UserLibCard({ work }) {
  const currentUser = useContext(CurrentUserContext);
  const initialState = {
    owned: work.owned,
    digital: work.digital,
    physical: work.physical,
    played: work.played,
    loanedout: work.loanedout,
    notes: work.notes,
  };
  const [formData, setFormData] = useState(initialState);

  // handle user form input before submit
  function handleChange(evt) {
    const { name, value } = evt.target;
    setFormData((fData) => ({
      ...fData,
      [name]: value,
    }));
  }

  // update work
  async function handleSubmit(evt) {
    evt.preventDefault();
    await MyMusicApi.updateUserWork(currentUser.id, work.id, formData);
    setFormData(initialState);
  }

  // delete work
  async function handleDelete(evt) {
    evt.preventDefault();
    await MyMusicApi.deleteUserWork(currentUser.id, work.id);
  }

  // display user detail card
  return (
    <div>
      <Card class="userLibCard">
        <CardTitle>
          <p>
            {work.title}
            <br />
            {work.composer}
          </p>
        </CardTitle>
        <CardBody>
          <Form class="myPiece" onSubmit={handleSubmit}>
            <FormGroup>
              <Label check>
                <Input
                  type="checkbox"
                  name="owned"
                  checked={work.owned}
                  onChange={handleChange}
                />
                <span></span>I own
              </Label>
            </FormGroup>
            <FormGroup>
              <Label check>
                <Input
                  type="checkbox"
                  name="digital"
                  checked={work.digital}
                  onChange={handleChange}
                />
                <span></span>I own digital copy
              </Label>
            </FormGroup>
            <FormGroup>
              <Label check>
                <Input
                  type="checkbox"
                  name="physical"
                  checked={work.physical}
                  onChange={handleChange}
                />
                <span></span>I own physical copy
              </Label>
            </FormGroup>
            <FormGroup>
              <Label check>
                <Input
                  type="checkbox"
                  name="played"
                  checked={work.played}
                  onChange={handleChange}
                />
                <span></span>
                I've played this piece
              </Label>
            </FormGroup>
            <FormGroup>
              <Label check>
                <Input
                  type="checkbox"
                  name="loanedout"
                  checked={work.loanedout}
                  onChange={handleChange}
                />
                <span></span>I have a copy loaned out to someone
              </Label>
            </FormGroup>
            <FormGroup style={{ marginLeft: "1vw" }}>
              <Label for="notes">Notes: </Label>
              <Input
                type="text"
                name="notes"
                placeholder={work.notes}
                onChange={handleChange}
              ></Input>
            </FormGroup>
            <Button>Submit changes</Button>
          </Form>
          <Button onClick={handleDelete}>Delete</Button>
        </CardBody>
      </Card>
    </div>
  );
}

export default UserLibCard;
