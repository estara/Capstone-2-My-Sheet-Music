import React, { useState } from 'react';
import {
  Card, CardBody, CardTitle, Button, Form, FormGroup, Input, Label
} from 'reactstrap';
import './UserLibCard.css';
import MyMusicApi from './api.js';

function UserLibCard ({ work }) {
  const initialState = {owned: work.owned, digital: work.digital, physical: work.physical, played: work.played, loanedout: work.loanedout, notes: work.notes}
  const [formData, setFormData] = useState(initialState);

  // handle user form input before submit
  function handleChange (evt) {
    const { name, value } = evt.target;
    setFormData(fData => ({
      ...fData,
      [name]: value
    }));
}

  // update work
  async function handleSubmit (evt) {
    evt.preventDefault();
    await MyMusicApi.updateUserWork(work.id, formData);
    setFormData(initialState);
  }

  // delete work
  async function handleDelete (evt) {
    evt.preventDefault();
    await MyMusicApi.deleteUserWork(work.id);
  }

  // display user detail card
  return (
    <div>
      <Card>
        <CardTitle>{work.title} {work.composer}</CardTitle>
          <CardBody>
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label check>
                    <Input type="checkbox" name="owned" onChange={handleChange} />{' '}
                    I own
                    </Label>
                </FormGroup>
                <FormGroup>
                    <Label check>
                    <Input type="checkbox" name="digital" onChange={handleChange} />{' '}
                      I own digital copy
                    </Label>
                </FormGroup>
                <FormGroup>
                    <Label check>
                    <Input type="checkbox" name="physical" onChange={handleChange} />{' '}
                    I own physical copy
                    </Label>
                </FormGroup>
                <FormGroup>
                  <Label check>
                    <Input type="checkbox" name="played" onChange={handleChange} />{' '}
                    I've played this piece
                    </Label>
                </FormGroup>
                <FormGroup>
                <Label check>
                    <Input type="checkbox" name="loanedout" onChange={handleChange} />{' '}
                    I have a copy loaned out to someone
                    </Label>
                </FormGroup>
                <FormGroup>
                    <Label for="notes">Notes:</Label>
                    <Input type="text" name="notes" placeholder={work.notes} onChange={handleChange}></Input>
                </FormGroup>
                <Button>Submit changes</Button>
            </Form>
            <Button onClick={handleDelete}>Delete</Button>
          </CardBody>
      </Card>
    </div>
  );
};

export default UserLibCard;