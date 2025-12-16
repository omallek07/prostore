import { APP_NAME } from '@/lib/constants';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='border-t p-5 flex-center'>
      {currentYear} &copy; {APP_NAME}. All Rights Reserved.
    </footer>
  );
}

export default Footer;
