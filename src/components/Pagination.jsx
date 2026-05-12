import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  // If there are no items at all, we can hide everything (or return a generic empty message)
  if (totalItems === 0) return null;

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    // Removed mt-6 and added w-full flex-1 to behave inside the Teachers.jsx flex container
    <div className="flex flex-col md:flex-row flex-1 items-center justify-between gap-4 w-full ml-0 md:ml-6">
      
      {/* Informational Text */}
      <div className="text-sm text-base-content/70">
        Showing <span className="font-medium text-base-content">{startItem}</span> to <span className="font-medium text-base-content">{endItem}</span> of <span className="font-medium text-base-content">{totalItems}</span> entries
      </div>

      {/* Only render the navigation buttons if there is more than 1 page */}
      {totalPages > 1 && (
        <div className="join">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="join-item btn btn-sm"
            aria-label="Previous"
          >
            <HiChevronLeft className="w-5 h-5" />
          </button>
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => onPageChange(number)}
              className={`join-item btn btn-sm ${currentPage === number ? 'btn-active' : ''}`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="join-item btn btn-sm"
            aria-label="Next"
          >
            <HiChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;