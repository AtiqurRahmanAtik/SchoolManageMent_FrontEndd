import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react'; // Ensure lucide-react is installed
import toast, { Toaster } from 'react-hot-toast'; // npm install react-hot-toast
import { useContactUs } from '../Hook/useContactUs'; // Adjust the import path as necessary

const Contact = () => {
  // Initialize the hook
  const { createContact } = useContactUs();

  // Form state for a realistic, professional feel
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Call the API via the hook
      await createContact(formData);
      
      // On success, show toaster and update UI state
      toast.success("Message sent successfully!");
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message UI after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      // Show error toaster if it fails
      toast.error(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Contact Information Data
  const contactInfo = [
    {
      icon: <MapPin className="text-[#1a82c4]" size={24} />,
      title: "Our Location",
      details: "85, Municipal Road, Luxmibazar, Dhaka-1100", // Based on the St. Francis flyer
    },
    {
      icon: <Phone className="text-[#1a82c4]" size={24} />,
      title: "Phone Number",
      details: "+880 1234 567 890\n+880 0987 654 321",
    },
    {
      icon: <Mail className="text-[#1a82c4]" size={24} />,
      title: "Email Address",
      details: "info@stfrancis.edu.bd\nsupport@stfrancis.edu.bd",
    },
    {
      icon: <Clock className="text-[#1a82c4]" size={24} />,
      title: "Office Hours",
      details: "Sunday - Thursday: 8:00 AM - 4:00 PM\nFriday & Saturday: Closed",
    }
  ];

  return (
    <div className="w-full bg-[#f9fafb] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      {/* React Toaster Component for Notifications */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <span className="text-gray-500 uppercase tracking-widest text-sm font-semibold block mb-2">
            Get In Touch
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a82c4] font-serif uppercase tracking-wide">
            Contact Us
          </h2>
          <div className="w-16 h-1 bg-[#f38a1d] mx-auto mt-4 rounded-full"></div>
          <p className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg">
            Have questions or need assistance? We're here to help. Reach out to us using the form below or through our official contact details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          
          {/* Left Column: Contact Information (Takes up 1 column on large screens) */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Contact Information</h3>
            
            {contactInfo.map((info, index) => (
              <div 
                key={index} 
                className="flex items-start p-6 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="flex-shrink-0 bg-blue-50 p-4 rounded-full mr-5">
                  {info.icon}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">{info.title}</h4>
                  <p className="text-gray-600 whitespace-pre-line text-sm leading-relaxed">
                    {info.details}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Contact Form (Takes up 2 columns on large screens) */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 font-serif">Send Us A Message</h3>
              
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                  <CheckCircle size={64} className="text-green-500 mb-4" />
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h4>
                  <p className="text-gray-600">
                    Thank you for reaching out. We have received your message and will get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Input */}
                    <div className="form-control w-full">
                      <label className="label pt-0">
                        <span className="label-text font-semibold text-gray-700">Full Name <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a82c4] focus:border-transparent transition-colors"
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Email Input */}
                    <div className="form-control w-full">
                      <label className="label pt-0">
                        <span className="label-text font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a82c4] focus:border-transparent transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Subject Input */}
                  <div className="form-control w-full">
                    <label className="label pt-0">
                      <span className="label-text font-semibold text-gray-700">Subject <span className="text-red-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a82c4] focus:border-transparent transition-colors"
                      placeholder="How can we help you?"
                    />
                  </div>

                  {/* Message Textarea */}
                  <div className="form-control w-full">
                    <label className="label pt-0">
                      <span className="label-text font-semibold text-gray-700">Your Message <span className="text-red-500">*</span></span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a82c4] focus:border-transparent transition-colors resize-none"
                      placeholder="Write your message here..."
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#1a82c4] text-white font-bold rounded-lg shadow-md hover:bg-[#156a9e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a82c4] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send size={18} />
                      </>
                    )}
                  </button>

                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;