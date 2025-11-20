export interface User {
  id: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  name: string;
  phone?: string | null;
  address?: string | null;
  created_at?: string;
  roles?: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  duration: string;
  image_url: string | null;
  is_active: boolean;
}

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  service_title: string;
  booking_date: string;
  booking_time: string;
  address: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_price: number;
  customer_name?: string;
  customer_email?: string;
}

// Sample users
export const sampleUsers: User[] = [
  {
    id: 'user1',
    email: 'user@example.com',
    password: 'password',
    role: 'user',
    name: 'John Doe',
    phone: '+1234567890',
    address: '123 Main St, City',
    created_at: '2024-01-01T00:00:00Z',
    roles: ['user']
  },
  {
    id: 'admin1',
    email: 'admin@example.com',
    password: 'adminpass',
    role: 'admin',
    name: 'Admin User',
    phone: '+0987654321',
    address: '456 Admin Ave, City',
    created_at: '2024-01-01T00:00:00Z',
    roles: ['admin']
  }
];

// Sample services
export const sampleServices: Service[] = [
  {
    id: '1',
    title: 'House Cleaning',
    description: 'Professional house cleaning service including dusting, vacuuming, and sanitizing.',
    category: 'Cleaning',
    price: 1500,
    duration: '2-3 hours',
    image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    is_active: true
  },
  {
    id: '2',
    title: 'Plumbing Repair',
    description: 'Fix leaks, unclog drains, and repair plumbing fixtures.',
    category: 'Plumbing',
    price: 2000,
    duration: '1-2 hours',
    image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
    is_active: true
  },
  {
    id: '3',
    title: 'Electrical Installation',
    description: 'Install new electrical outlets, switches, and lighting fixtures.',
    category: 'Electrical',
    price: 2500,
    duration: '2-4 hours',
    image_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80',
    is_active: true
  },
  {
    id: '4',
    title: 'Gardening Service',
    description: 'Lawn mowing, trimming, and general garden maintenance.',
    category: 'Gardening',
    price: 1200,
    duration: '1-2 hours',
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    is_active: true
  },
  {
    id: '5',
    title: 'Carpet Cleaning',
    description: 'Deep cleaning of carpets using professional equipment.',
    category: 'Cleaning',
    price: 1800,
    duration: '3-4 hours',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    is_active: true
  },
  {
    id: '6',
    title: 'Appliance Repair',
    description: 'Repair household appliances including refrigerators, washers, and dryers.',
    category: 'Repair',
    price: 2200,
    duration: '1-3 hours',
    image_url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80',
    is_active: true
  }
];

// Sample bookings (for user1)
export const sampleBookings: Booking[] = [
  {
    id: '1',
    user_id: 'user1',
    service_id: '1',
    service_title: 'House Cleaning',
    booking_date: '2024-12-01',
    booking_time: '10:00',
    address: '123 Main St, City',
    status: 'confirmed',
    total_price: 1500,
    customer_name: 'John Doe',
    customer_email: 'user@example.com'
  },
  {
    id: '2',
    user_id: 'user1',
    service_id: '2',
    service_title: 'Plumbing Repair',
    booking_date: '2024-12-05',
    booking_time: '14:00',
    address: '123 Main St, City',
    status: 'pending',
    total_price: 2000,
    customer_name: 'John Doe',
    customer_email: 'user@example.com'
  }
];

// In-memory storage for dynamic data
export let services = [...sampleServices];
export let bookings = [...sampleBookings];
export let users = [...sampleUsers];

// Functions to manipulate data
export const addService = (service: Omit<Service, 'id'>) => {
  const newService: Service = {
    ...service,
    id: Date.now().toString()
  };
  services.push(newService);
  return newService;
};

export const updateService = (id: string, updates: Partial<Service>) => {
  const index = services.findIndex(s => s.id === id);
  if (index !== -1) {
    services[index] = { ...services[index], ...updates };
    return services[index];
  }
  return null;
};

export const deleteService = (id: string) => {
  services = services.filter(s => s.id !== id);
};

export const addBooking = (booking: Omit<Booking, 'id' | 'customer_name' | 'customer_email'>) => {
  const user = users.find(u => u.id === booking.user_id);
  const newBooking: Booking = {
    ...booking,
    id: Date.now().toString(),
    customer_name: user?.name || 'Unknown',
    customer_email: user?.email || 'unknown@example.com'
  };
  bookings.push(newBooking);
  return newBooking;
};

export const updateBooking = (id: string, updates: Partial<Booking>) => {
  const index = bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    bookings[index] = { ...bookings[index], ...updates };
    return bookings[index];
  }
  return null;
};

export const getBookingsForUser = (userId: string) => {
  return bookings.filter(b => b.user_id === userId);
};