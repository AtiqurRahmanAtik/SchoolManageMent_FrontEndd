import React, { useEffect } from "react";
import useClass from "../Hook/useClass";

export default function ClassDropdown({ value, onChange }) {
  const { classes, getClasses, loading, error } = useClass();

  useEffect(() => {
    // Now getClasses exists because of the alias in the hook
    getClasses();
  }, [getClasses]);

  return (
    <div className="w-full">
      <select
        className="select select-sm w-full bg-base-200/50 border-none rounded-md focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select Class</option>

        {loading && <option disabled>Loading...</option>}
        {error && <option disabled className="text-error">Error loading</option>}

        {!loading &&
          classes?.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.className || cls.name}
            </option>
          ))}
      </select>
    </div>
  );
}