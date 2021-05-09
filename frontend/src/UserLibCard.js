import React, { useState } from 'react';
import {
  Card, CardText, CardBody,
  CardTitle, Button
} from 'reactstrap';
import { Link, useHistory } from 'react-router-dom';
import MyMusicApi from './api.js';

function UserLibCard ({ work }) {
  const initialState = {owned: work.owned, digital: work.digital, physical: work.physical, played: work.played, loanedout: work.loanedout, notes: work.notes}
  const history = useHistory();
  const [formData, setFormData] = useState(initialState);

  // handle user form input before submit
  function handleChange (evt) {
    const { name, value } = evt.target;
    setFormData(fData => ({
      ...fData,
      [name]: value
    }));
}

  // activate user
  async function handleSubmit (evt) {
    evt.preventDefault();
    user.state = "active";
    await MyMusicApi.updateUserWork(work.id, formData);
    setFormData(initialState);
  }

  // display user detail card
  return (
    <div>
      <Card>
        <CardTitle>{work.title} {work.composer}</CardTitle>
          <CardBody>
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Input type="checkbox" name="owned" placeholder="I Own" onChange={handleChange} required></Input>
                </FormGroup>
                <FormGroup>
                    <Input type="checkbox" name="digital" placeholder="I own digital copy" onChange={handleChange} required></Input>
                </FormGroup>
                <FormGroup>
                    <Input type="checkbox" name="physical" placeholder="I own physical copy" onChange={handleChange} required></Input>
                </FormGroup>
                <FormGroup>
                    <Input type="checkbox" name="played" placeholder="I've played this piece" onChange={handleChange} required></Input>
                </FormGroup>
                <FormGroup>
                    <Input type="checkbox" name="loanedout" placeholder="I have a copy loaned out to someone" onChange={handleChange} required></Input>
                </FormGroup>
                <FormGroup>
                    <Input type="text" name="notes" placeholder={work.notes} onChange={handleChange} required></Input>
                </FormGroup>
                <Button>Submit changes</Button>
            </Form>
          </CardBody>
      </Card>
    </div>
  );
};

export default UserLibCard;