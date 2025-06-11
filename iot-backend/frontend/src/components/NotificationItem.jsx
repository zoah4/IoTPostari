import React from "react";

const NotificationItem = ({ notif }) => {
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
    </li>
  );
};

export default NotificationItem;
