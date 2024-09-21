import React, { useState } from 'react';
import axios from 'axios';

const PaymentForm = () => {
  const [amount, setAmount] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create an order by sending the amount to the backend
      const response = await axios.post('http://localhost:5000/api/payments/create-order', { amount });
      console.log('Order Created:', response.data);
      alert('Order Created Successfully');
      // Additional logic like redirecting to the payment gateway or showing success message
    } catch (error) {
      console.log('Payment Error:', error);
      alert('Payment Failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Make Payment</h2>
      <label>Amount: </label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <button type="submit">Pay Now</button>
    </form>
  );
};

export default PaymentForm;
