import React, { useEffect } from 'react'
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { Row, Col, Image, ListGroup, Button, Card, CardTitle, Container } from "react-bootstrap";
import Loader from "../Loader";
import Message from "../Message";
import { addToCart, removeFromCart } from '../../actions/cartActions';
import { useDispatch, useSelector } from "react-redux";
import { Form } from 'react-bootstrap';



function CartScreen({params}) {
  
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch(); // Add this line to define dispatch

  const productId = id 
  const qty = location.search ? Number(location.search.split('=')[1]) : 1
  console.log(productId, qty)

  const cart = useSelector(state => state.cart)
  const { cartItems } = cart

  useEffect(() => {
    if(productId) {
      dispatch(addToCart(productId, qty))
    }
  }, [dispatch, productId, qty]); 

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate("/login?redirect=shipping")
  }

  return (
    <>
      <Container>
      <Row> 
        <Col md={8}>
          <h1>Cart Items</h1>
          {cartItems.length === 0 ? (
            <Message variant='info'>
              Your cart is empty <Link to="/">Go back</Link>
            </Message>
          ) : (
            <ListGroup variant='flush'>
              {cartItems.map(item => (
                <ListGroup.Item key={item.product}>
                  <Row>
                    <Col md={2}>
                      <Image src={item.image} alt={item.productName} fluid rounded />
                    </Col>
                    <Col md={3}>
                      <Link to={`/product/${item.product}`}>{item.productName}</Link>
                    </Col>
                    <Col md={2}>
                      ₱{item.price}
                    </Col>

                    <Col md={2}>
                      <Form.Control
                        as="select"
                        value={item.qty}
                        onChange={(e) => dispatch(addToCart(item.product, Number(e.target.value)))}
                      >
                        {
                          [... Array(item.stockCount).keys()].map((x) => 
                            <option key={x+1} value={x+1}>
                              {x+1}
                            </option>
                          )
                        }
                      </Form.Control>
                    </Col>

                    <Col md={1}>
                        <Button
                          type='button'
                          variant='light'
                          onClick={() => removeFromCartHandler(item.product)}
                        >
                          <i className='fas fa-trash'></i>
                        </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )

          }
        </Col>
      </Row>
      </Container>
    </>
  )
}

export default CartScreen