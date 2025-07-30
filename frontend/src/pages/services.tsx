import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Stethoscope, Edit, Trash2 } from "lucide-react";
import ServiceModal from "@/components/modals/service-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Services() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const { toast } = useToast();

  const { data: services, isLoading } = useQuery({
    queryKey: ["/api/services"],
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Service deleted",
        description: "Service has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete service.",
        variant: "destructive",
      });
    },
  });

  const handleEditService = (service: any) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(parseFloat(amount));
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'consultation':
        return 'fas fa-stethoscope';
      case 'diagnostic':
        return 'fas fa-vial';
      case 'treatment':
        return 'fas fa-pills';
      case 'surgery':
        return 'fas fa-cut';
      default:
        return 'fas fa-medical-icon';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'consultation':
        return 'bg-blue-100 text-blue-800';
      case 'diagnostic':
        return 'bg-green-100 text-green-800';
      case 'treatment':
        return 'bg-purple-100 text-purple-800';
      case 'surgery':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Services Management"
          subtitle="Manage hospital services and pricing"
        >
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-medical-blue hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Service
          </Button>
        </Header>

        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : services?.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No services found
              </h3>
              <p className="mt-2 text-gray-500">
                Get started by adding your first service.
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 bg-medical-blue hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Service
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {services?.map((service: any) => (
                <Card key={service.id} className="relative">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Stethoscope className="text-medical-blue" />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditService(service)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
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
                              <AlertDialogTitle>Delete Service</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {service.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteServiceMutation.mutate(service.id)}
                                className="bg-medical-red hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{service.name}</h4>
                    <p className="text-sm text-gray-500 mb-3">
                      {service.description || "No description provided"}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge className={getCategoryColor(service.category)}>
                        {service.category}
                      </Badge>
                      <span className="text-lg font-semibold text-medical-blue">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        service={editingService}
      />
    </div>
  );
}
