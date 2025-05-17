import React from 'react'
import { Card, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Rating from './Rating'

function Product({product}) {
  const renderTags = (tags) => {
    if (!tags || !Array.isArray(tags) || tags.length === 0) return null;
    
    return (
      <div className="d-flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => {
          if (!tag.tag_type || !tag.name) return null;

          return (
            <Badge 
              key={index} 
              bg={tag.color || 'secondary'}
              className="me-1"
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem'
              }}
            >
              {tag.tag_type}: {tag.name}
            </Badge>
          );
        })}
      </div>
    );
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
                {renderTags(product.tags)}
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