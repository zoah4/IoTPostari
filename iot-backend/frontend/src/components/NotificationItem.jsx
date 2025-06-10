import React from "react";

const NotificationItem = ({ notif, openDoor }) => {
    console.log(notif.info?.msgOriginator?.id)
  return (
    <li
      key={notif.id?.id || notif.id}
      className="p-4 border rounded shadow hover:bg-gray-100"
    >
      <strong>{notif.subject}</strong>
      <p>{notif.text}</p>
      <p className="text-sm text-gray-600">
        Device ID: {notif.info?.msgOriginator?.id || "N/A"}
      </p>
      <small>{new Date(notif.createdTime).toLocaleString()}</small>
      <div className="mt-2">
        <button
          onClick={() => openDoor(notif.info?.msgOriginator?.id)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Otključaj vrata
        </button>
      </div>
    </li>
  );
};

export default NotificationItem;
