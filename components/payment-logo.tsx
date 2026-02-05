import { Generic, Visa, Paypal } from 'react-payment-logos/dist/flat';

function PaymentIcon({ paymentMethodType }: { paymentMethodType: string }) {
  switch (paymentMethodType) {
    case 'PayPal':
      return <Paypal />;
    case 'Stripe':
      return <Visa />;
    case 'CashOnDelivery':
      return <Generic />;
    default:
      return <Generic />;
  }
}

export default PaymentIcon;
