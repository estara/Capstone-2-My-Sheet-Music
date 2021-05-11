import React, { useContext } from 'react';
import { Card, CardBody, CardText, Button } from "reactstrap";
import MyMusicApi from './api.js';
import { CurrentUserContext, UserLibDispatchContext, UserLibContext } from './MyMusicContext';


function LibCard ( { piece } ) {
    const currentUser = useContext(CurrentUserContext);
    const userLib = useContext(UserLibContext);
    const setuserLib = useContext(UserLibDispatchContext);
  
    // add composition to user library
    async function handleClick (evt) {
        evt.preventDefault();
        await MyMusicApi.addItem(currentUser.id, piece.id);
        setuserLib([...userLib, piece.id]);
    }

    // render card with 1 composition
    return (
      <section>
        <Card>
          <CardBody>
            <CardText className="font-bold text-left">
            <h4>{piece.title}</h4>
              <p>{piece.composer}</p>
                </CardText>
                <Button onClick={handleClick}>{(userLib && userLib.includes(piece.id)) ? "In Library" : "Add to Library"}</Button>
          </CardBody>
        </Card>
      </section>
    );
  }
  
  export default LibCard;