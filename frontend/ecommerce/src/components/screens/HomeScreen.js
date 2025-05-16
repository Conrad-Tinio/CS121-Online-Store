import React, { useEffect } from 'react'
import { Row, Col, Container } from 'react-bootstrap'
import Product from '../Product'
import Loader from '../Loader'
import Message from '../Message'
import { useDispatch, useSelector } from 'react-redux'
import { listProducts } from '../../actions/productActions'
import { useLocation } from 'react-router-dom'

function HomeScreen() {
    const dispatch = useDispatch()
    const location = useLocation()
    
    const productsList = useSelector(state => state.productsList)
    const { error, loading, products } = productsList

    // Get current category from URL
    const searchParams = new URLSearchParams(location.search)
    const currentCategory = searchParams.get('category') || ''

    // Fetch products based on filters
    useEffect(() => {
        const keyword = searchParams.get('keyword') || ''
        const category = searchParams.get('category') || ''
        const arrival = searchParams.get('arrival') || ''
        
        console.log('Current filters:', {
            keyword,
            category,
            arrival
        })
        
        dispatch(listProducts(keyword, category, arrival))
    }, [dispatch, location.search])

    return (
        <Container className="py-3">
            <h1>
                {currentCategory ? `${currentCategory} Products` : 'All Products'}
            </h1>
            {loading ? <Loader />
                : error ? <Message variant='danger'>{error}</Message>
                    : products.length === 0 ? <Message variant='info'>No products found</Message>
                        : (
                            <Row>
                                {products.map(product => (
                                    <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                                        <Product product={product} />
                                    </Col>
                                ))}
                            </Row>
                        )}
        </Container>
    )
}

export default HomeScreen
