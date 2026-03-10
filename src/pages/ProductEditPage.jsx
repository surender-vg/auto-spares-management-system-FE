import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { PRODUCT_CATEGORIES } from '../constants/categories';

const ProductEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isNew = !id || id === 'new';

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]);
    const [countInStock, setCountInStock] = useState(0);
    const [description, setDescription] = useState('');
    const [bikeModel, setBikeModel] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
            navigate('/login');
            return;
        }

        if (!isNew) {
            const fetchProduct = async () => {
                try {
                    const { data } = await axios.get(`/api/products/${id}`);
                    setName(data.name);
                    setPrice(data.price);
                    setImage(data.image);
                    setBrand(data.brand);
                    setCategory(data.category || PRODUCT_CATEGORIES[0]);
                    setCountInStock(data.countInStock);
                    setDescription(data.description);
                    setBikeModel(data.bikeModel);
                } catch (error) {
                    toast.error('Could not fetch product');
                }
            };
            fetchProduct();
        }
    }, [id, user, navigate, isNew]);

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            const { data } = await axios.post('/api/upload', formData, config);
            // Prefix with backend url is handled by proxy or we need to ensure full path?
            // The backed returns something like '/uploads/image-123.jpg'
            // Since we wired uploads to static, it should work relative to root.
            setImage(data);
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
            toast.error('Image upload failed');
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            if (!name || !price || !image || !brand || !category || !description || !countInStock || !bikeModel) {
                toast.error('Please fill in all fields');
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const productData = {
                name,
                price: parseFloat(price),
                image,
                brand,
                category,
                description,
                countInStock: parseInt(countInStock),
                bikeModel,
            };

            if (isNew) {
                await axios.post('/api/products', productData, config);
                toast.success('Product created');
            } else {
                await axios.put(`/api/products/${id}`, productData, config);
                toast.success('Product updated');
            }
            navigate('/admin/productlist');
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
            toast.error(errorMsg);
        }
    };

    return (
        <>
            <Link to='/admin/productlist' className='btn btn-light my-3'>
                Go Back
            </Link>
            <h1>{isNew ? 'Create Product' : 'Edit Product'}</h1>
            <Form onSubmit={submitHandler}>
                <Form.Group controlId='name'>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type='name'
                        placeholder='Enter name'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    ></Form.Control>
                </Form.Group>

                <Form.Group controlId='price'>
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                        type='number'
                        placeholder='Enter price'
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    ></Form.Control>
                </Form.Group>

                <Form.Group controlId='image'>
                    <Form.Label>Image</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder='Enter image url'
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                    ></Form.Control>
                    <Form.Control
                        type="file"
                        label="Choose File"
                        onChange={uploadFileHandler}
                    ></Form.Control>
                    {uploading && <div>Uploading...</div>}
                </Form.Group>

                <Form.Group controlId='brand'>
                    <Form.Label>Brand</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder='Enter brand'
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                    ></Form.Control>
                </Form.Group>

                <Form.Group controlId='countInStock'>
                    <Form.Label>Count In Stock</Form.Label>
                    <Form.Control
                        type='number'
                        placeholder='Enter stock'
                        value={countInStock}
                        onChange={(e) => setCountInStock(e.target.value)}
                    ></Form.Control>
                </Form.Group>

                <Form.Group controlId='category'>
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {PRODUCT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group controlId='description'>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder='Enter description'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></Form.Control>
                </Form.Group>

                <Form.Group controlId='bikeModel'>
                    <Form.Label>Bike Model</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder='Enter compatible bike model'
                        value={bikeModel}
                        onChange={(e) => setBikeModel(e.target.value)}
                    ></Form.Control>
                </Form.Group>

                <Button type='submit' variant='primary' className="mt-3">
                    {isNew ? 'Create' : 'Update'}
                </Button>
            </Form>
        </>
    );
};

export default ProductEditPage;
