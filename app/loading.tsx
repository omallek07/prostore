import Image from 'next/image';
import loader from '@/assets/loader.gif';

const LoadingPage = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
    }}
  >
    <h1>Loading...</h1>
    <Image src={loader} height={150} width={150} alt='Loading...' />
  </div>
);

export default LoadingPage;
