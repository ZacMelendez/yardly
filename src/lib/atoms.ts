"use client";
import { atom } from "jotai";
import { atomWithQuery, atomWithMutation } from "jotai-tanstack-query";
// Removed Decimal import as we're using numbers for client-side types
import { fetchJSON } from "./fetchJson";
import { InvoiceItem } from "@prisma/client";

// Types
export type Customer = {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    notes?: string | null;
    createdAt: string | Date;
};

export type Job = {
    id: string;
    title: string;
    date?: string | Date | null;
    status: string;
    createdAt: string | Date;
    customer?: Omit<Customer, "createdAt">;
    recurrenceRule?: {
        frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
        interval: number;
        byWeekDay?:
            | ("SU" | "MO" | "TU" | "WE" | "TH" | "FR" | "SA")[]
            | undefined;
        byMonthDay?: number[] | undefined;
        byMonth?: number[] | undefined;
        count?: number | undefined;
        until?: string | undefined;
    } | null;
    recurrenceEnd?: string | Date | null;
    endType?: "never" | "count" | "until" | undefined;
    isRecurring?: boolean;
    estimateId?: string;
    estimate?: Estimate;
    parentJobId?: string | null;
};

export type EstimateItem = {
    id: string;
    serviceId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    estimateId: string;
    service?: Service;
};

export type Estimate = {
    id: string;
    title: string;
    status: "draft" | "sent" | "accepted" | "rejected";
    createdAt: string | Date;
    updatedAt: string | Date;
    customerId: string;
    userId: string;
    customer?: Omit<Customer, "createdAt">;
    items?: EstimateItem[];
    jobs?: Job[];
};

export type InvoiceItemType = {
    id: string;
    description: string | null;
    quantity: number;
    unitPrice: number;
};

export type Invoice = {
    id: string;
    customerId: string;
    status: string;
    dueDate: string | Date | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    customer?: Omit<Customer, "createdAt">;
    items?: InvoiceItemType[];
};

export type Service = {
    id: string;
    name: string;
    defaultPrice: number;
    unit: string;
    isActive: boolean;
    description: string | null;
    category: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    estimateItems?: EstimateItem[];
    invoiceItems?: InvoiceItem[];
    userId: string;
};

export type DashboardData = {
    metrics: {
        customers: number;
        estimates: number;
        unpaidInvoices: number;
        scheduledJobs: number;
    };
    recentCustomers: { id: string; name: string }[];
};

export type CustomerResponse = {
    data: Customer[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
};

// Initial data atoms for SSR hydration
export const initialCustomersAtom = atom<CustomerResponse>();
export const initialCustomerDetailAtom = atom<Customer>({
    id: "",
    name: "",
    createdAt: "",
});
export const initialEstimateDetailAtom = atom<EstimateDetail | null>(null);
export const initialJobDetailAtom = atom<Job | null>(null);
export const initialJobsAtom = atom<Job[]>([]);
export const initialEstimatesAtom = atom<Estimate[]>([]);
export const initialDashboardAtom = atom<DashboardData | null>(null);
export const initialServicesAtom = atom<Service[]>([]);

// Customers atoms
export const customersAtom = atomWithQuery((get) => ({
    queryKey: ["customers"],
    queryFn: () => fetchJSON<CustomerResponse>("/api/customers"),
    initialData: get(initialCustomersAtom),
}));

export const createCustomerMutationAtom = atomWithMutation(() => ({
    mutationKey: ["create-customer"],
    mutationFn: (customer: Omit<Customer, "id" | "createdAt">) =>
        fetchJSON<Customer>("/api/customers", {
            method: "POST",
            body: JSON.stringify(customer),
        }),
}));

export const deleteCustomerMutationAtom = atomWithMutation(() => ({
    mutationKey: ["delete-customer"],
    mutationFn: (id: string) =>
        fetchJSON<Customer>(`/api/customers/${id}`, {
            method: "DELETE",
        }),
}));

// Customer detail with related data
export type CustomerDetail = Customer & {
    jobs: Job[];
    estimates: Estimate[];
};

export type EstimateDetail = Estimate & {
    customer: Customer;
    items: EstimateItem[];
};

export const updateCustomerMutationAtom = atomWithMutation(() => ({
    mutationKey: ["update-customer"],
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
        fetchJSON<Customer>(`/api/customers/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }),
}));

// Jobs atoms
export const jobsAtom = atomWithQuery((get) => ({
    queryKey: ["jobs"],
    queryFn: () => fetchJSON<Job[]>("/api/jobs"),
    initialData: get(initialJobsAtom),
}));

export const createJobMutationAtom = atomWithMutation(() => ({
    mutationKey: ["create-job"],
    mutationFn: (job: {
        title: string;
        customerId: string;
        date?: string | null;
        status: string;
    }) =>
        fetchJSON<Job>("/api/jobs", {
            method: "POST",
            body: JSON.stringify(job),
        }),
}));

// Upcoming jobs map atom
export const upcomingJobsMapAtom = atomWithQuery(() => ({
    queryKey: ["upcoming-jobs-map"],
    queryFn: () => fetchJSON<{ jobs: any[] }>("/api/dashboard/upcoming-jobs"),
}));

export const updateJobMutationAtom = atomWithMutation(() => ({
    mutationKey: ["update-job"],
    mutationFn: ({ id, data }: { id: string; data: Partial<Job> }) =>
        fetchJSON<Job>(`/api/jobs/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }),
}));

export const deleteJobMutationAtom = atomWithMutation(() => ({
    mutationKey: ["delete-job"],
    mutationFn: (id: string) =>
        fetchJSON<Job>(`/api/jobs/${id}`, {
            method: "DELETE",
        }),
}));

// Estimates atoms
export const estimatesAtom = atomWithQuery((get) => ({
    queryKey: ["estimates"],
    queryFn: () => fetchJSON<Estimate[]>("/api/estimates"),
    initialData: get(initialEstimatesAtom),
}));

export const createEstimateMutationAtom = atomWithMutation(() => ({
    mutationKey: ["create-estimate"],
    mutationFn: (estimate: {
        title: string;
        customerId: string;
        items: {
            serviceId: string;
            description?: string;
            quantity: number;
            unitPrice: number;
        }[];
    }) =>
        fetchJSON<Estimate>("/api/estimates", {
            method: "POST",
            body: JSON.stringify(estimate),
        }),
}));

export const updateEstimateMutationAtom = atomWithMutation(() => ({
    mutationKey: ["update-estimate"],
    mutationFn: ({ id, data }: { id: string; data: Partial<Estimate> }) =>
        fetchJSON<Estimate>(`/api/estimates/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }),
}));

export const deleteEstimateMutationAtom = atomWithMutation(() => ({
    mutationKey: ["delete-estimate"],
    mutationFn: (id: string) =>
        fetchJSON<Estimate>(`/api/estimates/${id}`, {
            method: "DELETE",
        }),
}));

// Services atoms
export const servicesAtom = atomWithQuery((get) => ({
    queryKey: ["services"],
    queryFn: () => fetchJSON<Service[]>("/api/services"),
    initialData: get(initialServicesAtom),
}));

export const createServiceMutationAtom = atomWithMutation(() => ({
    mutationKey: ["create-service"],
    mutationFn: (service: {
        name: string;
        defaultPrice: number;
        unit: string;
        isActive: boolean;
        description: string | null;
        category: string | null;
    }) =>
        fetchJSON<Service>("/api/services", {
            method: "POST",
            body: JSON.stringify(service),
        }),
}));

export const updateServiceMutationAtom = atomWithMutation(() => ({
    mutationKey: ["update-service"],
    mutationFn: ({ id, data }: { id: string; data: Partial<Service> }) =>
        fetchJSON<Service>(`/api/services/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }),
}));

// Dashboard atom
export const dashboardAtom = atomWithQuery((get) => ({
    queryKey: ["dashboard"],
    queryFn: () => fetchJSON<DashboardData>("/api/dashboard"),
    initialData: get(initialDashboardAtom),
}));
