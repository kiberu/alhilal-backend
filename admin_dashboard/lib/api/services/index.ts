// Export all API services
export { AuthService } from "./auth"
export { TripService } from "./trips"
export { BookingService } from "./bookings"
export { PilgrimService } from "./pilgrims"
export { DashboardService } from "./dashboard"
export { PassportService } from "./passports"
export { VisaService } from "./visas"
export { DuaService } from "./duas"
export { PackageService } from "./packages"
export { UserService } from "./users"
export { PaymentService } from "./payments"
export { HotelService, FlightService } from "./hotels-flights"

// Export types
export type {
  LoginCredentials,
  ChangePasswordData,
  AuthResponse,
} from "./auth"

export type {
  PackageHotel,
  PackageFlight,
  CreatePackageHotelData,
  UpdatePackageHotelData,
  CreatePackageFlightData,
  UpdatePackageFlightData,
} from "./hotels-flights"

