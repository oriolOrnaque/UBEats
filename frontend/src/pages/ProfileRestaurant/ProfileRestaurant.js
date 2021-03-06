import React, { useState, useEffect} from 'react';
import { Button, Container, Row, Card, Col, Modal, Nav } from 'react-bootstrap';
import pollo from "../../images/banner.jpg";
import pikachu from "../../images/pikachu.jpg";
import bucket from "../../images/bucket.jpg";
import wings from "../../images/alitas.jpg";

import restService from "../../api/restaurant.js";

//import 'bootstrap/dist/css/bootstrap.min.css';

const listaPlatos = [
  {
    title: "Pollo frito",
    price: "3$",
    Image: pollo,
    desc: "Delicious fried chicken, 100% deadly."
  },
  {
    title: "Hot wings",
    price: "6$",
    Image: wings,
    desc: "Chicken wings, of course! *wink wink*"
  },
  {
    title: "Fried Pikachu",
    price: "4$",
    Image: pikachu,
    desc: "Simply electric."
  },
  {
    title: "Chicken bucket",
    price: "11$",
    Image: bucket,
    desc: "Will satisfy all your needs."
  },
  {
    title: "Fried Pikachu",
    price: "4$",
    Image: pikachu,
    desc: "Simply electric."
  },
  {
    title: "Fried Pikachu",
    price: "4$",
    Image: pikachu,
    desc: "Simply electric."
  },
];

const listaSecciones = [
  {
    Header: "Picked for you",
    ListaPlatos: listaPlatos
  },
  {
    Header: "Classics",
    ListaPlatos: listaPlatos
  },
  {
    Header: "Recently ordered",
    ListaPlatos: listaPlatos
  },
  {
    Header: "New items",
    ListaPlatos: listaPlatos
  },
]



function ProfileRestaurant({rest_id, restaurantPhoto}) {
  const [showModal, setShowModal] = useState(false);
  const [menuList, setMenuList] = useState([{
    title: "Default menu",
    price: "11$",
    Image: bucket,
    desc: "Loading data."
  }]);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);


  const fetchMenu = async () => {
    const items = await restService.getMenu(rest_id);
    setMenuList(items);
    console.log(menuList);
  };

  useEffect(() => {
    fetchMenu();
  }, []);


  const listaSecciones_dyn = [
    {
      Header: "Picked for you",
      ListaPlatos: menuList
    },
    {
      Header: "Classics",
      ListaPlatos: menuList
    },
    {
      Header: "Recently ordered",
      ListaPlatos: menuList
    },
    {
      Header: "New items",
      ListaPlatos: menuList
    },
  ]
  
    /**
    * Generates a product's card
    * props: Product's name, description, image and price.
    */

  function CardPlato(props) {
    return (
      <Card style={{ width: '14rem' }}>
        <Card.Img className="card-img-top" variant="top" src={props.Image} fluid/>
        <Card.Body>
          <Card.Title className="textFont">{props.Name}</Card.Title>
          <Card.Text className="textFont">
            {props.Description}
          </Card.Text>
          {/** <Button variant="success">Añadir al carrito</Button> */}
        </Card.Body>
      </Card>
    );
  }

  /**
    * Generates an array of product's cards
    * props: Array of product's data
    */


  function FilaPlatos (props) {
    var plato;
    var listaPlatos = []
    for (plato of props.listaPlatos) {
      
      var cardPlato = <CardPlato 
        Name={plato.title}
        Description={plato.desc}
        Price={plato.price}
        Image={restaurantPhoto}
      >
      </CardPlato>

      listaPlatos.push(cardPlato);
    }
    return (listaPlatos);
  }

  /**
    * Generates a product's row
    * props: Dictionary with the row's header and the product's info array
    */

  function SeccionPlatos (props) {
    var seccionesReturn = [];
    
    for (var seccion in props.listaSecciones) {
      
      var seccionX = 
        <Row className="restaurantContainer">
          <Container>
            <Row>
              <h5 
                className="sectionHeader"
                id={props.listaSecciones[seccion].Header}
              >{props.listaSecciones[seccion].Header}</h5>
            </Row>
            <Row className="productRow">
              
              <FilaPlatos listaPlatos={props.listaSecciones[seccion].ListaPlatos}>
              </FilaPlatos>

            </Row>
          </Container>
        </Row>
      
      seccionesReturn.push(seccionX)
    }

    return (seccionesReturn);
  }

  /**
    * Generates a categories navigation bar
    * props: Dictionary with the row's header and the product's info array
    * (only the headers are used)
    */

  function ListaCategorias(props) {
    var listaCategorias = []
    var columnas = 0;

    for (var categoria in props.listaSecciones) {
      var hrefitem = "#" + props.listaSecciones[categoria].Header;
      var categoriaX =
      <Nav.Item as="li">
        <Nav.Link href={hrefitem} className="navbar-link">{props.listaSecciones[categoria].Header}</Nav.Link>
      </Nav.Item>
      
      listaCategorias.push(categoriaX)
    }

    /** Desplegable aun no despliega */
    var desplegable =
    <Nav.Item as="li" className="ml-auto">
      <Nav.Link href="#" className="navbar-link">More</Nav.Link>
    </Nav.Item>

    listaCategorias.push(desplegable);


    return(listaCategorias);
  }

  return (
    <section className="restaurantProfile">

      <Container>
        <Row>
          <Container fluid>
            {/* Banner */}
            <Row className="restaurantBanner"
            style={{backgroundImage: 'url(' +restaurantPhoto+ ')'}}>
              <Container >
                <Row style={{height: '55%'}}>
                </Row>
                <Row className="restaurantTitle">
                  <h1 className="textFont"><strong>KFC</strong></h1>
                </Row>
                <Row className="restaurantTitle">
                  <h8><strong>Delivery: 2$ • 15/20 min • 4.8/5(300+)</strong></h8>
                </Row>
              </Container>
            </Row>
            </Container>
        </Row>
          
        <Row style={{height: '1%'}}>

        </Row>
        
        <Row className="restaurantContainer">
          <Container>
            <Row>
              <p>$ • Chicken • American • <a onClick={handleShow} href="#">More info</a></p> 
            </Row>
            <Row>
              <p>Rambla de Catalunya 58, 08001, Barcelona</p>
            </Row>
          </Container>
        </Row>

        {/**
         * This next component is the Modal, shown only when
         * More Info is clicked.
         */}

        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>KFC</Modal.Title>
          </Modal.Header>
          <Modal.Body>This is a Modal with the restaurant's info.</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/**
         * This next part generates the categories' navbar.
         */}

        <Container className="">
          <Nav as="ul" className="categories-navbar">
            <ListaCategorias listaSecciones={listaSecciones_dyn}></ListaCategorias>
          </Nav>
        </Container>

        {/**
         * And this one generates the product rows.
         */}
        {console.log(listaSecciones_dyn)}
        <SeccionPlatos listaSecciones={listaSecciones_dyn}>

        </SeccionPlatos>
        
      </Container>
      
    </section>

  );
}

export default ProfileRestaurant;