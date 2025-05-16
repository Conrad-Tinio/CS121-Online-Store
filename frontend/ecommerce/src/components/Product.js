import React from 'react'
import { Card, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Rating from './Rating'

function Product({product}) {
  const getArrivalBadge = (status) => {
    switch (status) {
      case 'new':
        return <Badge bg="success">🆕 New Arrival</Badge>
      case 'recent':
        return <Badge bg="info">📅 Recent</Badge>
      default:
        return <Badge bg="dark">⭐ Classic</Badge>
    }
  }

  return (
    <Card className='my-3 p-3 rounded'>
        <Link to={`/product/${product._id}`}>
            <Card.Img src={product.image} />
        </Link>

        <Card.Body>
            <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
                <Card.Title as="div">
                    <strong>{product.productName}</strong>
                </Card.Title>
            </Link>

            <Card.Text as="div">
                <div className="my-2">
                    {getArrivalBadge(product.arrival_status)}
                </div>
            </Card.Text>

            <Card.Text as="div">
                <div className="my-3">
                    {product.rating} from {product.numReviews} reviews
                </div>
            </Card.Text>

            <Card.Text as="h3">
                ₱{product.price}
            </Card.Text>

            <Card.Text>
                <Rating 
                    value={product.rating}
                    text={` ${product.numReviews} reviews`}
                    color={"#f8e825"}
                />
            </Card.Text>
        </Card.Body>
            
    </Card>
  )
}

export default Product