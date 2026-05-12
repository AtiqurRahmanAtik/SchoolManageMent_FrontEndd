import React from 'react';

const TableControls = ({ itemsPerPage, onItemsPerPageChange, searchTerm, onSearchChange }) => (
  <div className="flex flex-col md:flex-row justify-between items-center gap-3">
    <div className="flex items-center gap-2">
      <span className="text-sm text-base-content/70">Show</span>
      <select
        value={itemsPerPage}
        onChange={onItemsPerPageChange}
        className="select select-bordered select-sm focus:outline-none"
      >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
      </select>
      <span className="text-sm text-base-content/70">entries</span>
    </div>
    <div className="relative w-full md:w-80">
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={onSearchChange}
        className="input input-bordered input-sm w-full focus:outline-none"
      />
    </div>
  </div>
);

export default TableControls;
