import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Eye, Printer, Trash2, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Billing() {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [currentService, setCurrentService] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState("");
  const { toast } = useToast();

  const { data: patients } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: services } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const { data: hospitalSettings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/invoices", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice created",
        description: "Invoice has been successfully created.",
      });
      clearForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create invoice.",
        variant: "destructive",
      });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice deleted",
        description: "Invoice has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete invoice.",
        variant: "destructive",
      });
    },
  });

  const updateInvoiceStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PUT", `/api/invoices/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice updated",
        description: "Invoice status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update invoice status.",
        variant: "destructive",
      });
    },
  });

  const addServiceToInvoice = () => {
    if (!currentService || !quantity || !unitPrice) {
      toast({
        title: "Missing information",
        description: "Please fill in all service details.",
        variant: "destructive",
      });
      return;
    }

    const service = Array.isArray(services) ? services.find((s: any) => s.id === currentService) : null;
    if (!service) return;

    const total = quantity * parseFloat(unitPrice);
    const newService = {
      serviceId: service.id,
      serviceName: service.name,
      quantity,
      unitPrice,
      total: total.toString(),
    };

    setSelectedServices([...selectedServices, newService]);
    setCurrentService("");
    setQuantity(1);
    setUnitPrice("");
  };

  const removeServiceFromInvoice = (index: number) => {
    const updated = selectedServices.filter((_, i) => i !== index);
    setSelectedServices(updated);
  };

  const calculateTotal = () => {
    const subtotal = selectedServices.reduce((sum, service) => sum + parseFloat(service.total), 0);
    const taxRate = parseFloat((hospitalSettings as any)?.taxRate || "0") / 100;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const createInvoice = () => {
    if (!selectedPatient || selectedServices.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select a patient and add at least one service.",
        variant: "destructive",
      });
      return;
    }

    const { subtotal, taxAmount, total } = calculateTotal();
    const invoiceNumber = `INV-${Date.now()}`;

    const invoiceData = {
      invoice: {
        invoiceNumber,
        patientId: selectedPatient,
        invoiceDate,
        dueDate,
        subtotal: subtotal.toString(),
        taxRate: (hospitalSettings as any)?.taxRate || "0",
        taxAmount: taxAmount.toString(),
        total: total.toString(),
        status: "pending",
      },
      items: selectedServices,
    };

    createInvoiceMutation.mutate(invoiceData);
  };

  const clearForm = () => {
    setSelectedPatient("");
    setSelectedServices([]);
    setCurrentService("");
    setQuantity(1);
    setUnitPrice("");
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const printInvoice = (invoice: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const patient = Array.isArray(patients) ? patients.find((p: any) => p.id === invoice.patientId) : null;
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px; }
            .hospital-name { font-size: 28px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .patient-info, .invoice-info { width: 45%; }
            .section-title { font-weight: bold; color: #1e40af; margin-bottom: 10px; font-size: 16px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .table th { background-color: #f8f9fa; font-weight: bold; }
            .totals { text-align: right; margin-top: 20px; }
            .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .final-total { font-weight: bold; font-size: 18px; color: #1e40af; }
            .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .status.paid { background-color: #10b981; color: white; }
            .status.pending { background-color: #f59e0b; color: white; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="hospital-name">${(hospitalSettings as any)?.name || 'City General Hospital'}</div>
            <div>${(hospitalSettings as any)?.address || 'Hospital Address'}</div>
            <div>${(hospitalSettings as any)?.phone || 'Phone'} | ${(hospitalSettings as any)?.email || 'Email'}</div>
          </div>
          
          <div class="invoice-details">
            <div class="patient-info">
              <div class="section-title">Bill To:</div>
              <div><strong>${patient?.name || 'Unknown Patient'}</strong></div>
              <div>${patient?.phone || ''}</div>
              <div>${patient?.email || ''}</div>
              <div>${patient?.address || ''}</div>
            </div>
            <div class="invoice-info">
              <div class="section-title">Invoice Details:</div>
              <div><strong>Invoice #:</strong> ${invoice.invoiceNumber}</div>
              <div><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</div>
              <div><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</div>
              <div><strong>Status:</strong> <span class="status ${invoice.status}">${invoice.status.toUpperCase()}</span></div>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${Array.isArray(invoice.items) ? invoice.items.map((item: any) => 
                '<tr>' +
                  '<td>' + item.serviceName + '</td>' +
                  '<td>' + item.quantity + '</td>' +
                  '<td>' + formatCurrency(item.unitPrice) + '</td>' +
                  '<td>' + formatCurrency(item.total) + '</td>' +
                '</tr>'
              ).join('') : ''}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(invoice.subtotal)}</span>
            </div>
            <div class="total-row">
              <span>Tax (${invoice.taxRate}%):</span>
              <span>${formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div class="total-row final-total">
              <span>Total:</span>
              <span>${formatCurrency(invoice.total)}</span>
            </div>
          </div>

          <div style="margin-top: 50px; text-align: center; color: #666;">
            <p>Thank you for choosing ${(hospitalSettings as any)?.name || 'our hospital'}!</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const { subtotal, taxAmount, total } = calculateTotal();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Billing & Invoices"
          subtitle="Create and manage patient invoices"
        />

        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {/* Invoice Creation Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Quick Invoice Creation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Patient
                  </Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose patient..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(patients) ? patients.map((patient: any) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      )) : null}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Date
                  </Label>
                  <Input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Services Selection */}
              <div className="mb-4">
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Services
                </Label>
                <div className="grid grid-cols-4 gap-4">
                  <Select value={currentService} onValueChange={(value) => {
                    setCurrentService(value);
                    const service = Array.isArray(services) ? services.find((s: any) => s.id === value) : null;
                    if (service) {
                      setUnitPrice(service.price);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(services) ? services.map((service: any) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - {formatCurrency(service.price)}
                        </SelectItem>
                      )) : null}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Unit Price"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                  />
                  <Button
                    onClick={addServiceToInvoice}
                    className="bg-medical-green hover:bg-green-700"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Selected Services Table */}
              {Array.isArray(selectedServices) && selectedServices.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Service
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Unit Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedServices.map((service, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {service.serviceName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {service.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatCurrency(service.unitPrice)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {formatCurrency(service.total)}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeServiceFromInvoice(index)}
                              className="text-medical-red hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold text-gray-900">
                  <div>Subtotal: {formatCurrency(subtotal)}</div>
                  {taxAmount > 0 && (
                    <div className="text-sm">Tax ({hospitalSettings?.taxRate}%): {formatCurrency(taxAmount)}</div>
                  )}
                  <div>Total: {formatCurrency(total)}</div>
                </div>
                <div className="space-x-3">
                  <Button variant="outline" onClick={clearForm}>
                    Clear
                  </Button>
                  <Button
                    onClick={createInvoice}
                    className="bg-medical-blue hover:bg-blue-700"
                    disabled={createInvoiceMutation.isPending}
                  >
                    {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Recent Invoices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded" />
                    ))}
                  </div>
                </div>
              ) : invoices?.length === 0 ? (
                <div className="p-12 text-center">
                  <h3 className="text-lg font-medium text-gray-900">No invoices found</h3>
                  <p className="mt-2 text-gray-500">Create your first invoice above.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice #
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(invoices) ? invoices.map((invoice: any) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-medical-blue">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {invoice.patient?.name || "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(invoice.total)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => printInvoice(invoice)}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            {invoice.status !== "paid" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateInvoiceStatusMutation.mutate({ id: invoice.id, status: "paid" })}
                                className="text-green-600 hover:text-green-700"
                                title="Mark as Paid"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-medical-red hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete invoice {invoice.invoiceNumber}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteInvoiceMutation.mutate(invoice.id)}
                                    className="bg-medical-red hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </td>
                        </tr>
                      )) : null}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
