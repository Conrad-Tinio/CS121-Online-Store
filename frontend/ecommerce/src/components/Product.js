import React from 'react'
import { Card } from 'react-bootstrap'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Rating from './Rating'

function Product({product}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCategoryClick = (e, categoryName) => {
    e.preventDefault();
    
    // Preserve existing search parameters
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('category', categoryName);
    
    navigate(`/?${searchParams.toString()}`);
  }

  return (
    <Card className='my-3 p-3 rounded'>
        <Link to={`/product/${product._id}`}>
            <Card.Img src={product.image} />
        </Link>

        <Card.Body>
            <Link to={`/product/${product._id}`} className='text-dark'>
                <Card.Title as="h3">
                    <strong>{product.productName}</strong>
                </Card.Title>
            </Link>

            <Card.Text as="div">
                <div className="my-3">
                    {product.rating} from {product.numReviews} reviews
                </div>
            </Card.Text>

            <Card.Text as="h4">
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