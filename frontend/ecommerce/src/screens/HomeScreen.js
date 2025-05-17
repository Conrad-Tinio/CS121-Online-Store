import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { listProducts } from '../actions/productActions';

function HomeScreen() {
  const dispatch = useDispatch();
  const location = useLocation();

  const productList = useSelector(state => state.productList);
  const { error, loading, products } = productList;

  // Get URL parameters
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const arrival = searchParams.get('arrival') || '';

  useEffect(() => {
    console.log('\nHomeScreen - URL parameters changed:');
    console.log('Current URL:', location.search);
    console.log('Parsed parameters:', {
      keyword,
      category,
      arrival
    });
    
    dispatch(listProducts(keyword, category, arrival));
  }, [dispatch, location.search]);

  useEffect(() => {
    if (products) {
      console.log('\nHomeScreen - Products updated:');
      console.log('Total products:', products.length);
      products.forEach(product => {
        console.log(`- ${product.productName}: arrival_status='${product.arrival_status}'`);
      });
    }
  }, [products]);

  return (
    <div>
      <h1>Products</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <div className="products-container">
          <style>
            {`
              .products-container .row {
                margin-right: -60px !important;
                margin-left: -60px !important;
                row-gap: 120px !important;
              }
              .products-container .col {
                padding: 60px !important;
              }
              .product-wrapper {
                margin-bottom: 120px !important;
              }
              @media (max-width: 768px) {
                .products-container .row {
                  margin-right: -30px !important;
                  margin-left: -30px !important;
                  row-gap: 80px !important;
                }
                .products-container .col {
                  padding: 30px !important;
                }
                .product-wrapper {
                  margin-bottom: 80px !important;
                }
              }
            `}
          </style>
          <Row>
            {products.map(product => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3} className="col">
                <div className="product-wrapper">
                  <Product product={product} />
                </div>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
}

export default HomeScreen; 