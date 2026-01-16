import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EllipsisVertical, ShoppingCartIcon } from 'lucide-react';
import ModeToggle from './mode-toggle';
import UserButton from './user-button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

const Buttons = (
  <>
    <Button asChild variant='ghost'>
      <Link href='/cart'>
        <ShoppingCartIcon />
        Cart
      </Link>
    </Button>
    <UserButton />
  </>
);

function Menu() {
  return (
    <div className='flex justify-end gap-3'>
      <nav className='hidden md:flex w-full max-w-xs gap-1'>
        <ModeToggle />
        {Buttons}
      </nav>
      <nav className='md:hidden'>
        <Sheet>
          <SheetTrigger className='align-middle'>
            <EllipsisVertical />
          </SheetTrigger>
          <SheetContent className='flex flex-col items-start'>
            <SheetTitle>Menu</SheetTitle>
            <ModeToggle />
            {Buttons}
            <SheetDescription></SheetDescription>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}

export default Menu;
