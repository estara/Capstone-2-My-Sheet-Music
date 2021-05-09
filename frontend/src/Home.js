import React from 'react';
import { Button } from 'reactstrap';

// display home page
function Home () {
    return(
        <div>
            <h3>Welcome to My Sheet Music!</h3>
            <p>Login or Sign Up to manage your personal sheet music library.</p>
            <Button color="primary" href="/signup">Sign Up</Button>
            <Button color="primary" href="/login">Login</Button>
        </div>
    )
}

export default Home;