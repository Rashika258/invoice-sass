import InvoiceList from "../../components/InvoiceList";

export const metadata = {
  title: "Invoices",
};

export default function Page() {
  return (
    <div className="min-h-full py-10 px-6">
      <InvoiceList />
    </div>
  );
}
