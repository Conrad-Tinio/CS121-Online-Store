import React, { useState, useEffect } from 'react'
import { Row, Col, Container, Form, Button } from 'react-bootstrap'
import Product from '../Product'
import Loader from '../Loader'
import Message from '../Message'
import { useDispatch, useSelector } from 'react-redux'
import { listProducts } from '../../actions/productActions'
import { useLocation } from 'react-router-dom'
import axios from 'axios'

function HomeScreen() {
    const dispatch = useDispatch()
    const location = useLocation()
    
    const [tagTypes, setTagTypes] = useState([])
    const [selectedTags, setSelectedTags] = useState({})
    const [loading, setLoading] = useState(true)
    const [priceRange, setPriceRange] = useState({ min: 0, max: 0 })
    const [maxPrice, setMaxPrice] = useState(0)
    const [initialLoad, setInitialLoad] = useState(true)
    
    const productsList = useSelector(state => state.productsList)
    const { error, loading: productsLoading, products } = productsList

    // Get current category from URL
    const searchParams = new URLSearchParams(location.search)
    const currentCategory = searchParams.get('category') || ''

    // Initial products fetch
    useEffect(() => {
        console.log('Fetching products with search:', location.search)
        dispatch(listProducts(location.search))
    }, [dispatch, location.search])

    // Update max price and price range
    useEffect(() => {
        if (products && products.length > 0) {
            const highestPrice = Math.max(...products.map(product => product.price))
            setMaxPrice(highestPrice)

            // Get price range from URL
            const urlMinPrice = searchParams.get('price_min')
            const urlMaxPrice = searchParams.get('price_max')

            if (initialLoad) {
                // On initial load, set price range from URL or use default values
                setPriceRange({
                    min: urlMinPrice !== null ? parseInt(urlMinPrice) : 0,
                    max: urlMaxPrice !== null ? parseInt(urlMaxPrice) : highestPrice
                })
                setInitialLoad(false)
            } else if (!urlMinPrice && !urlMaxPrice) {
                // If no price filters in URL, reset to full range
                setPriceRange({
                    min: 0,
                    max: highestPrice
                })
            }
        }
    }, [products, initialLoad])

    // Update price range when URL changes
    useEffect(() => {
        const urlMinPrice = searchParams.get('price_min')
        const urlMaxPrice = searchParams.get('price_max')
        
        if (urlMinPrice !== null && urlMaxPrice !== null) {
            setPriceRange({
                min: parseInt(urlMinPrice),
                max: parseInt(urlMaxPrice)
            })
        }
    }, [location.search])

    // Fetch tag types
    useEffect(() => {
        const fetchTagTypes = async () => {
            try {
                const { data } = await axios.get('/api/tag-types/')
                setTagTypes(data)
                const initialSelectedTags = {}
                data.forEach(type => {
                    initialSelectedTags[type.name] = []
                })
                setSelectedTags(initialSelectedTags)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching tag types:', error)
                setLoading(false)
            }
        }
        fetchTagTypes()
    }, [])

    // Update selected tags from URL
    useEffect(() => {
        const newSelectedTags = {}
        tagTypes.forEach(type => {
            const value = searchParams.get(type.name.toLowerCase())
            if (value) {
                newSelectedTags[type.name] = value.split(',')
            } else {
                newSelectedTags[type.name] = []
            }
        })
        setSelectedTags(newSelectedTags)

        // Update price range from URL if present
        const minPrice = searchParams.get('price_min')
        const maxPrice = searchParams.get('price_max')
        if (minPrice !== null && maxPrice !== null) {
            setPriceRange({
                min: parseInt(minPrice),
                max: parseInt(maxPrice)
            })
        }
    }, [location.search, tagTypes])

    const handleTagSelect = (tagType, tagName) => {
        setSelectedTags(prevSelectedTags => {
            const updatedTags = { ...prevSelectedTags }
            const currentTagsForType = updatedTags[tagType] || []
            
            if (currentTagsForType.includes(tagName)) {
                updatedTags[tagType] = currentTagsForType.filter(tag => tag !== tagName)
            } else {
                updatedTags[tagType] = [...currentTagsForType, tagName]
            }
            
            const params = new URLSearchParams(location.search)
            
            Object.entries(updatedTags).forEach(([type, tags]) => {
                if (tags.length > 0) {
                    params.set(type.toLowerCase(), tags.join(','))
                } else {
                    params.delete(type.toLowerCase())
                }
            })
            
            if (currentCategory) {
                params.set('category', currentCategory)
            }
            
            const newSearch = params.toString()
            window.history.pushState({}, '', `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`)
            dispatch(listProducts(newSearch))
            
            return updatedTags
        })
    }

    const handlePriceChange = (e) => {
        const { name, value } = e.target
        const numValue = parseInt(value) || 0
        
        setPriceRange(prev => {
            let newMin = prev.min
            let newMax = prev.max

            if (name === 'min') {
                newMin = Math.min(Math.max(0, numValue), prev.max)
            } else if (name === 'max') {
                newMax = Math.min(Math.max(prev.min, numValue), maxPrice)
            }

            return {
                min: newMin,
                max: newMax
            }
        })
    }

    const handleSliderChange = (e) => {
        const value = parseInt(e.target.value) || 0
        setPriceRange(prev => ({
            ...prev,
            max: Math.max(prev.min, Math.min(value, maxPrice))
        }))
    }

    const applyPriceFilter = () => {
        const params = new URLSearchParams(location.search)
        params.set('price_min', priceRange.min)
        params.set('price_max', priceRange.max)
        const newSearch = params.toString()
        window.history.pushState({}, '', `${window.location.pathname}?${newSearch}`)
        dispatch(listProducts(newSearch))
    }

    const clearFilters = () => {
        const params = new URLSearchParams()
        if (currentCategory) {
            params.set('category', currentCategory)
        }
        window.history.pushState({}, '', `${window.location.pathname}${params.toString() ? `?${params}` : ''}`)
        dispatch(listProducts(params.toString()))
        setSelectedTags({})
        setPriceRange({ min: 0, max: maxPrice })
    }

    return (
        <Container>
            <Row className="py-4">
                {/* Filter Section */}
                {currentCategory && (
                    <Col md={3}>
                        <div className="filter-section">
                            <div className="filter-header">
                                <h4>Filter</h4>
                                <button className="clear-btn" onClick={clearFilters}>Clear</button>
                            </div>

                            {/* Price Range */}
                            <div className="price-range mb-4">
                                <h5>Price Range</h5>
                                <div className="price-inputs">
                                    <input
                                        type="number"
                                        name="min"
                                        value={priceRange.min}
                                        onChange={handlePriceChange}
                                        className="price-input"
                                        min="0"
                                        max={priceRange.max}
                                    />
                                    <span className="price-separator">-</span>
                                    <input
                                        type="number"
                                        name="max"
                                        value={priceRange.max}
                                        onChange={handlePriceChange}
                                        className="price-input"
                                        min={priceRange.min}
                                        max={maxPrice}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max={maxPrice}
                                    value={priceRange.max}
                                    onChange={handleSliderChange}
                                    className="price-slider"
                                />
                                <button className="apply-price-btn" onClick={applyPriceFilter}>
                                    Apply Price
                                </button>
                            </div>

                            {/* Tag Filters */}
                            {tagTypes.map(tagType => (
                                <div key={tagType.id} className="filter-group mb-4">
                                    <h5>{tagType.name}</h5>
                                    <div className="tag-buttons">
                                        {tagType.tags.map(tag => (
                                            <button
                                                key={tag.id}
                                                className={`tag-button ${selectedTags[tagType.name]?.includes(tag.name) ? 'active' : ''}`}
                                                onClick={() => handleTagSelect(tagType.name, tag.name)}
                                            >
                                                {tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Col>
                )}

                {/* Products Section */}
                <Col md={currentCategory ? 9 : 12}>
                    {productsLoading ? (
                        <Loader />
                    ) : error ? (
                        <Message variant='danger'>{error}</Message>
                    ) : !products ? (
                        <Message variant='info'>No products found</Message>
                    ) : products.length === 0 ? (
                        <Message variant='info'>No products found in this category</Message>
                    ) : (
                        <div className="products-grid">
                            <style>
                                {`
                                    .products-grid .row {
                                        margin: 0 -15px;
                                        row-gap: 60px !important;
                                    }
                                    .products-grid .col {
                                        padding: 0 15px;
                                    }
                                    @media (max-width: 768px) {
                                        .products-grid .row {
                                            row-gap: 40px !important;
                                        }
                                    }
                                `}
                            </style>
                            <Row>
                                {products.map(product => (
                                    <Col key={product._id} sm={12} md={6} lg={4} xl={4}>
                                        <Product product={product} />
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}
                </Col>
            </Row>

            <style>
                {`
                    .filter-section {
                        background: white;
                        padding: 1.5rem;
                        border-radius: 15px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }

                    .filter-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 1.5rem;
                    }

                    .filter-header h4 {
                        margin: 0;
                        font-weight: 600;
                        color: #333;
                    }

                    .clear-btn {
                        background: none;
                        border: none;
                        color: #666;
                        font-size: 0.9rem;
                        cursor: pointer;
                    }

                    .filter-group h5 {
                        color: #333;
                        font-size: 1rem;
                        margin-bottom: 1rem;
                    }

                    .price-range {
                        margin-bottom: 2rem;
                    }

                    .price-inputs {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-bottom: 1rem;
                    }

                    .price-input {
                        width: 80px;
                        padding: 8px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        text-align: center;
                    }

                    .price-separator {
                        color: #666;
                    }

                    .price-slider {
                        width: 100%;
                        margin: 1rem 0;
                    }

                    .apply-price-btn {
                        width: 100%;
                        padding: 8px;
                        background: #0275d8;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: background-color 0.2s;
                    }

                    .apply-price-btn:hover {
                        background: #0056b3;
                    }

                    .tag-buttons {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                    }

                    .tag-button {
                        padding: 6px 12px;
                        border: 1px solid #ddd;
                        border-radius: 20px;
                        background: white;
                        color: #666;
                        font-size: 0.9rem;
                        cursor: pointer;
                        transition: all 0.2s;
                    }

                    .tag-button:hover {
                        background: #f8f9fa;
                        border-color: #0275d8;
                        color: #0275d8;
                    }

                    .tag-button.active {
                        background: #0275d8;
                        border-color: #0275d8;
                        color: white;
                    }

                    /* Custom range slider styling */
                    input[type="range"] {
                        -webkit-appearance: none;
                        width: 100%;
                        height: 4px;
                        background: #ddd;
                        border-radius: 2px;
                        outline: none;
                    }

                    input[type="range"]::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        width: 20px;
                        height: 20px;
                        background: #0275d8;
                        border-radius: 50%;
                        cursor: pointer;
                        transition: background-color 0.2s;
                    }

                    input[type="range"]::-webkit-slider-thumb:hover {
                        background: #0056b3;
                    }

                    /* Remove number input arrows */
                    input[type="number"]::-webkit-inner-spin-button,
                    input[type="number"]::-webkit-outer-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                    }
                `}
            </style>
        </Container>
    )
}

export default HomeScreen
