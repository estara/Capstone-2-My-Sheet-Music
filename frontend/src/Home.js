import React from "react";
import {
  Button,
  Card,
  CardImg,
  CardImgOverlay,
  Container,
  Row,
} from "reactstrap";

// display home page
function Home() {
  return (
    <div>
      <Container>
        <Row>
          <div class="homeCard">
            <Card>
              <CardImg src="./sheetMusic.jpg" alt="sheet music" />
              <CardImgOverlay></CardImgOverlay>
            </Card>
          </div>
          <div class="info">
            <h1>Welcome to My Sheet Music!</h1>
            <p>Login or Sign Up to manage your personal sheet music library.</p>
            <Button href="/signup">Sign Up</Button>
            <Button href="/login">Login</Button>
          </div>
        </Row>
      </Container>
    </div>
  );
}

export default Home;
