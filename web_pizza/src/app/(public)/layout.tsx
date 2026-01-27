import Footer from "@/components/layouts/footer";
import Header from "@/components/layouts/header";


export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header />
      {children}
      
    </div>
  );
}
