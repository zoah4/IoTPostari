import React from "react";

const HistoryItem = ({ history }) => {

  return (
    <li
      className="p-4 border rounded shadow hover:bg-gray-100"
    >
      <strong>{history.key}</strong>
      <small className="text-gray-600">
        {new Date(history.ts).toLocaleString()}
      </small>
    </li>
  );
};

export default HistoryItem;
