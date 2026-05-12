import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const Error404 = () => {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>404 - Page Not Found | School Management</title>
                <meta name="description" content="The page you are looking for does not exist." />
            </Helmet>
            <div className="flex items-center justify-center min-h-screen bg-base-100 px-6">
            <div className="max-w-md w-full text-center">
                {/* Visual Element */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <h1 className="text-9xl font-extrabold text-base-300 tracking-tighter">
                            404
                        </h1>
                        <p className="absolute inset-0 flex items-center justify-center text-2xl font-semibold text-base-content mt-4">
                            Lost your way?
                        </p>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-base-content mb-4">
                    Page Not Found
                </h2>
                
                <p className="text-base-content/70 mb-8 leading-relaxed">
                    It looks like the page you’re looking for doesn't exist or has been moved. 
                    Let’s get your school management experience back on track.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                        to="/" 
                        className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-full shadow-lg shadow-primary/30 transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                        Return to Home
                    </Link>
                    <button 
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center border border-base-300 text-base-content font-medium py-3 px-8 rounded-full hover:bg-base-200 transition-all"
                    >
                        Go Back
                    </button>
                </div>

                <div className="mt-12 pt-8 border-t border-base-200">
                    <p className="text-sm text-base-content/50">
                        Need assistance? <Link to="/contact" className="text-primary hover:underline">Contact IT Support</Link>
                    </p>
                </div>
            </div>
        </div>
        </>
    );
};

export default Error404;