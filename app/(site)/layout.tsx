import Navbar from './components/navbar/Navbar';

const MainLayout = async ({
  children
}: {
  children: React.ReactNode;
}) => {
  return ( 
    <div className="h-full w-full">
      <div className="md:flex hidden h-full w-[500px] z-30 flex-col fixed inset-y-0 border-r-2">
        <Navbar/> 
      </div>
      <main className="md:pl-[510px] h-full w-full">
        {children}
      </main>
    </div>
   );
}
 
export default MainLayout;