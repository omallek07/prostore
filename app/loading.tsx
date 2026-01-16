import Image from 'next/image';
import loader from '@/assets/loader.gif';

const LoadingPage = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
    }}
  >
    <Image src={loader} height={150} width={150} alt='Loading...' />
    <h1 style={{ marginTop: '20px' }}>Loading...</h1>
  </div>
);

export default LoadingPage;
