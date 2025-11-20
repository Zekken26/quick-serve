import { services, bookings, users, addService, updateService, deleteService, addBooking, updateBooking, getBookingsForUser, Service, Booking } from "./data";
import { useAuth } from "@/hooks/useAuth";

// Mock API that returns hardcoded data
async function mockRequest<T = any>(path: string, method: string, body?: any, auth = false): Promise<T> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  if (auth) {
    // For demo, assume auth is always valid
  }

  // Handle different endpoints
  if (path === "/api/status/") {
    return { status: "static" } as T;
  }

  if (path === "/api/services/") {
    if (method === "GET") {
      return services as T;
    }
    if (method === "POST") {
      const serviceData = body;
      const newService = addService(serviceData);
      return newService as T;
    }
  }

  if (path.startsWith("/api/services/") && path.endsWith("/")) {
    const id = path.split("/")[3];
    if (method === "PUT") {
      const updated = updateService(id, body);
      if (!updated) throw new Error("Service not found");
      return updated as T;
    }
    if (method === "DELETE") {
      deleteService(id);
      return {} as T;
    }
  }

  if (path === "/api/bookings/") {
    if (method === "GET") {
      // Get current user and return their bookings
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.id) {
        return getBookingsForUser(currentUser.id) as T;
      }
      return [] as T;
    }
    if (method === "POST") {
      const bookingData = body;
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const service = services.find(s => s.id === bookingData.service_id);
      if (!service) throw new Error("Service not found");

      const newBooking = addBooking({
        ...bookingData,
        user_id: currentUser.id,
        service_title: service.title,
        total_price: service.price,
        status: 'pending'
      });
      return newBooking as T;
    }
  }

  if (path === "/api/admin/bookings/") {
    if (method === "GET") {
      // Return all bookings for admin
      return bookings as T;
    }
  }

  if (path === "/api/admin/users/") {
    if (method === "GET") {
      // Return all users for admin
      return users as T;
    }
  }

  if (path.startsWith("/api/bookings/") && path.endsWith("/")) {
    const id = path.split("/")[3];
    if (method === "PATCH") {
      const updated = updateBooking(id, body);
      if (!updated) throw new Error("Booking not found");
      return updated as T;
    }
  }

  if (path.startsWith("/api/uploads/service-image/")) {
    // Mock upload response
    return { url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80" } as T;
  }

  throw new Error(`Endpoint not implemented: ${method} ${path}`);
}

export const api = {
  get: <T = any>(path: string, auth = false) => mockRequest<T>(path, "GET", undefined, auth),
  post: <T = any>(path: string, body?: any, auth = false) => mockRequest<T>(path, "POST", body, auth),
  put: <T = any>(path: string, body?: any, auth = false) => mockRequest<T>(path, "PUT", body, auth),
  patch: <T = any>(path: string, body?: any, auth = false) => mockRequest<T>(path, "PATCH", body, auth),
  delete: <T = any>(path: string, auth = false) => mockRequest<T>(path, "DELETE", undefined, auth),
  upload: <T = any>(path: string, formData: FormData, auth = false) => mockRequest<T>(path, "POST", formData, auth),
};
