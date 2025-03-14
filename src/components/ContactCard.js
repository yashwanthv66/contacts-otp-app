import React from 'react';
import { Link } from 'react-router-dom';

const ContactCard = ({ contact }) => {
  return (
    <Link to={`/contact/${contact.id}`} className="contact-card">
      <div className="contact-info">
        <h3>{contact.firstName} {contact.lastName}</h3>
        <p>{contact.phoneNumber}</p>
      </div>
    </Link>
  );
};

export default ContactCard;