import React, { useState } from "react";
import { Form, FormGroup, Button, Input } from "reactstrap";
import { useHistory } from "react-router-dom";

function Login({ login }) {
  const initialState = { username: "", password: "" };
  const [formData, setFormData] = useState(initialState);
  const history = useHistory();

  // handle user form input before submit
  function handleChange(evt) {
    const { name, value } = evt.target;
    setFormData((fData) => ({
      ...fData,
      [name]: value,
    }));
  }

  // handle form submission
  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      const res = await login(formData);
      setFormData(initialState);
      history.push(`/userLib/${res.username}`);
    } catch (err) {
      return <p>Bad login, please try again.</p>;
    }
  }

  // display login form
  return (
    <div>
      <h2>Login</h2>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
          />
        </FormGroup>
        <br />
        <FormGroup>
          <Input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
        </FormGroup>
        <br />
        <Button>Submit</Button>
      </Form>
    </div>
  );
}

export default Login;
