import React, { useEffect } from "react";
import useExamination from "../Hook/useExamination";

export default function ExaminationDropdown({ value, onChange }) {
  const {
    examinations,
    fetchExaminationsByBranch,
    loading,
    error,
  } = useExamination();

  useEffect(() => {
    fetchExaminationsByBranch();
  }, [fetchExaminationsByBranch]);

  return (
    <div className="w-full">
      <select
        className="select select-sm w-full bg-base-200/50 border-none rounded-md focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">
          Select Examination
        </option>

        {loading && (
          <option disabled>
            Loading...
          </option>
        )}

        {error && (
          <option disabled className="text-error">
            Failed to load
          </option>
        )}

        {!loading &&
          examinations?.map((exam) => (
            <option key={exam._id} value={exam._id}>
              {exam.examName || exam.examinationName || "Unnamed Exam"}
            </option>
          ))}
      </select>
    </div>
  );
}