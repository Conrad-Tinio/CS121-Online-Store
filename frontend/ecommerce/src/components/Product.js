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
                fontSize: '0.75rem',
                fontWeight: '500'
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
    <Card className="h-100 product-card">
      <style>
        {`
          .product-card {
            transition: all 0.3s ease !important;
            border: 1px solid #e0e0e0 !important;
          }
          .product-card:hover {
            transform: translateY(-8px) !important;
            border-color: #28a745 !important;
            box-shadow: 0 8px 16px rgba(40, 167, 69, 0.2) !important;
          }
          .product-card:hover .product-title {
            color: #28a745 !important;
          }
          .product-card:hover .btn-primary {
            background-color: #28a745 !important;
            border-color: #28a745 !important;
          }
        `}
      </style>
      <Link to={`/product/${product._id}`} className="text-decoration-none">
        <div className="position-relative">
          <Card.Img 
            src={product.image} 
            className="card-img-top"
            alt={product.productName}
          />
          {product.stockCount === 0 && (
            <Badge 
              bg="danger" 
              className="position-absolute top-0 end-0 m-2"
            >
              Out of Stock
            </Badge>
          )}
        </div>

        <Card.Body className="d-flex flex-column">
          <Card.Title as="h3" className="product-title">
            {product.productName}
          </Card.Title>

          {renderTags(product.tags)}

          <div className="mt-auto">
            <div className="d-flex align-items-center mb-2">
              <Rating 
                value={product.rating}
                text={`${product.numReviews} reviews`}
                color={"#f8e825"}
              />
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <span className="price">₱{product.price}</span>
              {product.stockCount > 0 ? (
                <Badge bg="success" className="stock-badge">
                  In Stock
                </Badge>
              ) : (
                <Badge bg="secondary" className="stock-badge">
                  Coming Soon
                </Badge>
              )}
            </div>
          </div>
        </Card.Body>
      </Link>
    </Card>
  )
}

export default Product