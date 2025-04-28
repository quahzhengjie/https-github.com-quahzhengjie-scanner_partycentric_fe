// services/customerStore.ts
import { mockCustomers } from '@/mockData/customer';
import { Customer, CustomerLifecycleStatus } from '@/types/customer';
import { DocumentService } from './documentService';

// Initial mock data
let customers: Customer[] = [...mockCustomers];

// Service functions
export const CustomerService = {
    getAllCustomers: () => {
        return [...customers];
    },

    getCustomerByBasicNumber: (basicNumber: string) => {
        return customers.find(c => c.basicNumber === basicNumber);
    },

    // Add new customer
    addCustomer: (customer: Customer) => {
        // Generate new basic number
        const lastNumber = Math.max(...customers.map(c => 
            parseInt(c.basicNumber.replace('BN', ''))
        ));
        const newBasicNumber = `BN${String(lastNumber+1).padStart(3, '0')}`;
        
        // Set default lifecycle status as "Onboarding" for new customers
        const newCustomer = {
            ...customer,
            basicNumber: newBasicNumber,
            lifecycleStatus: customer.lifecycleStatus || "Onboarding",
            lifecycleStatusDate: customer.lifecycleStatusDate || new Date().toISOString().slice(0, 10)
        };

        customers = [...customers, newCustomer];
        
        // Initialize document records for this new customer
        DocumentService.initializeCustomerDocuments(newBasicNumber);
        
        return newCustomer;
    },

    updateCustomer: (customer: Customer) => {
        customers = customers.map(c => c.basicNumber === customer.basicNumber ? customer : c);
        return customer;
    },

    searchCustomers: (basicNumber?: string, name?: string, lifecycleStatus?: CustomerLifecycleStatus) => {
        return customers.filter(customer => {
            const matchesBasicNumber = !basicNumber || 
                customer.basicNumber.toLowerCase().includes(basicNumber.toLowerCase());
            const matchesName = !name ||
                customer.name.toLowerCase().includes(name.toLowerCase());
            const matchesLifecycleStatus = !lifecycleStatus ||
                customer.lifecycleStatus === lifecycleStatus;
            
            return matchesBasicNumber && matchesName && matchesLifecycleStatus;
        });
    },

    // Update customer lifecycle status
    updateLifecycleStatus: (basicNumber: string, newStatus: CustomerLifecycleStatus) => {
        const customer = customers.find(c => c.basicNumber === basicNumber);
        
        if (!customer) {
            return null;
        }
        
        const updatedCustomer = {
            ...customer,
            lifecycleStatus: newStatus,
            lifecycleStatusDate: new Date().toISOString().slice(0, 10)
        };
        
        customers = customers.map(c => c.basicNumber === basicNumber ? updatedCustomer : c);
        
        return updatedCustomer;
    },

    // Get customers by lifecycle status
    getCustomersByLifecycleStatus: (status: CustomerLifecycleStatus) => {
        return customers.filter(c => c.lifecycleStatus === status);
    },
    
    // Get lifecycle status counts for dashboard
    getLifecycleStatusCounts: () => {
        const counts: Record<CustomerLifecycleStatus, number> = {
            Prospective: 0,
            Onboarding: 0,
            Active: 0,
            Dormant: 0,
            Suspended: 0,
            Closed: 0,
            Rejected: 0
        };
        
        customers.forEach(customer => {
            if (customer.lifecycleStatus) {
                counts[customer.lifecycleStatus]++;
            }
        });
        
        return counts;
    },
    
    // Get all possible lifecycle statuses
    getLifecycleStatusOptions: () => {
        return [
            { value: "Prospective", label: "Prospective" },
            { value: "Onboarding", label: "Onboarding" },
            { value: "Active", label: "Active" },
            { value: "Dormant", label: "Dormant" },
            { value: "Suspended", label: "Suspended" },
            { value: "Closed", label: "Closed" },
            { value: "Rejected", label: "Rejected" }
        ];
    }
};