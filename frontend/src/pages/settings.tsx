import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Hospital, Upload } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [hospitalPhone, setHospitalPhone] = useState("");
  const [hospitalEmail, setHospitalEmail] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState("");
  const [autoBackup, setAutoBackup] = useState(false);
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings updated",
        description: "Hospital settings have been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update hospital settings.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (settings) {
      setHospitalName(settings.name || "");
      setHospitalAddress(settings.address || "");
      setHospitalPhone(settings.phone || "");
      setHospitalEmail(settings.email || "");
      setCurrency(settings.currency || "USD");
      setTaxRate(settings.taxRate || "");
    }
  }, [settings]);

  const handleSaveHospitalInfo = () => {
    const data = {
      name: hospitalName,
      address: hospitalAddress,
      phone: hospitalPhone,
      email: hospitalEmail,
      currency,
      taxRate,
      logoUrl: settings?.logoUrl || null,
    };
    updateSettingsMutation.mutate(data);
  };

  const handleSaveSystemSettings = () => {
    const data = {
      name: hospitalName,
      address: hospitalAddress,
      phone: hospitalPhone,
      email: hospitalEmail,
      currency,
      taxRate,
      logoUrl: settings?.logoUrl || null,
    };
    updateSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            title="Hospital Settings"
            subtitle="Configure hospital information and branding"
          />
          <main className="flex-1 overflow-auto p-6">
            <div className="animate-pulse space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="h-96 bg-gray-200 rounded-xl" />
                <div className="h-96 bg-gray-200 rounded-xl" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Hospital Settings"
          subtitle="Configure hospital information and branding"
        />

        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="grid grid-cols-2 gap-6">
            {/* Hospital Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Hospital Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital Name
                    </Label>
                    <Input
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="Enter hospital name"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </Label>
                    <Textarea
                      value={hospitalAddress}
                      onChange={(e) => setHospitalAddress(e.target.value)}
                      placeholder="Enter hospital address"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </Label>
                      <Input
                        value={hospitalPhone}
                        onChange={(e) => setHospitalPhone(e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </Label>
                      <Input
                        type="email"
                        value={hospitalEmail}
                        onChange={(e) => setHospitalEmail(e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSaveHospitalInfo}
                    className="bg-medical-blue hover:bg-blue-700"
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Logo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Hospital Logo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <Hospital className="h-16 w-16 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Current logo (placeholder)</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload new logo</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                  <Button className="mt-4 bg-medical-blue hover:bg-blue-700">
                    Upload Logo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Settings */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Currency
                  </Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Rate (%)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    placeholder="0.0"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <Checkbox
                  id="auto-backup"
                  checked={autoBackup}
                  onCheckedChange={setAutoBackup}
                />
                <Label htmlFor="auto-backup" className="text-sm text-gray-700">
                  Enable automatic data backup
                </Label>
              </div>
              <Button
                onClick={handleSaveSystemSettings}
                className="mt-4 bg-medical-blue hover:bg-blue-700"
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
