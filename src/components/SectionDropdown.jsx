import React, { useEffect } from "react";
import useSection from "../Hook/useSection";

export default function SectionDropdown({ classId, value, onChange }) {
  const { sections, getSections, loading, error } = useSection();

  useEffect(() => {
    // Only fetch if a class is selected
    if (classId) {
      // Pass a high limit so we get all sections for the dropdown, bypassing the 10-item limit
      getSections(1, 100);
    }
  }, [classId, getSections]);

  // Filter sections array to only show sections belonging to the selected class
  const filteredSections = sections?.filter(
    (sec) => sec.classId === classId || sec.class?._id === classId
  );

  return (
    <div className="w-full">
      <select
        className="select select-sm w-full bg-base-200/50 border-none rounded-md focus:outline-none disabled:opacity-50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!classId || loading}
      >
        <option value="">Select Section</option>

        {!classId && <option disabled>Select class first</option>}
        {loading && <option disabled>Loading...</option>}
        {error && <option disabled>Error loading</option>}

        {!loading && classId &&
          filteredSections?.map((sec) => (
            <option key={sec._id} value={sec._id}>
              {sec.sectionName || sec.name}
            </option>
          ))}
      </select>
    </div>
  );
}