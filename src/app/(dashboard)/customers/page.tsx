import { Plus } from "lucide-react";
import { getPartyBalances } from "@/actions/reports";
import { getCompanyProfile } from "@/actions/settings";
import {
  CustomerFormDialog,
  DeleteCustomerButton,
} from "@/components/customers/customer-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/invoice-utils";

export default async function CustomersPage() {
  const [parties, profile] = await Promise.all([
    getPartyBalances(),
    getCompanyProfile(),
  ]);
  const currency = profile?.currency ?? "INR";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parties</h1>
          <p className="text-muted-foreground">
            Customers and suppliers with outstanding to collect and to pay.
          </p>
        </div>
        <CustomerFormDialog
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Party
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Parties ({parties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {parties.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No parties yet. Add a customer or supplier to start billing.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">To collect</TableHead>
                  <TableHead className="text-right">To pay</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parties.map((party) => (
                  <TableRow key={party.id}>
                    <TableCell className="font-medium">{party.name}</TableCell>
                    <TableCell>{party.partyType}</TableCell>
                    <TableCell>{party.taxId || "—"}</TableCell>
                    <TableCell>{party.phone || "—"}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(party.receivable, currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(party.payable, currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <CustomerFormDialog
                          customer={party}
                          trigger={
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          }
                        />
                        <DeleteCustomerButton customerId={party.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
