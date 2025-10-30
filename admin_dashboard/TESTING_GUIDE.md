# Frontend Testing Guide

## Overview

This guide covers testing strategies for the Al-Hilal Admin Dashboard using Jest and React Testing Library.

## Setup

### Installation

```bash
cd admin_dashboard
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest jest jest-environment-jsdom
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

## Test Structure

### 1. Unit Tests - API Client

**Location:** `lib/api/__tests__/client.test.ts`

Tests the core HTTP client functionality:
- URL building
- Request methods (GET, POST, PATCH, DELETE)
- Authentication headers
- Error handling
- Retry logic

**Example:**
```typescript
it('should make GET request with authorization header', async () => {
  const mockResponse = { success: true, data: { id: '1' } }
  
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => mockResponse,
  })

  const result = await client.get('trips/1', undefined, 'test-token')
  
  expect(result).toEqual(mockResponse)
})
```

### 2. Unit Tests - API Services

**Location:** `lib/api/__tests__/services.test.ts`

Tests service layer methods:
- Dashboard stats and activity
- Trip CRUD operations
- Booking management
- Pilgrim operations

**Example:**
```typescript
it('should fetch dashboard stats', async () => {
  const mockStats = {
    trips: { total: 10, active: 5 },
    bookings: { active: 20 },
  }

  apiClient.get = jest.fn().mockResolvedValueOnce({
    success: true,
    data: mockStats,
  })

  const result = await DashboardService.getStats('token')
  
  expect(result.data).toEqual(mockStats)
})
```

### 3. Hook Tests

**Location:** `hooks/__tests__/useAuth.test.tsx`

Tests React hooks:
- Authentication state
- User session management
- Role checking
- Redirect logic

**Example:**
```typescript
it('should return user and tokens when authenticated', () => {
  useSession.mockReturnValue({
    data: { user, accessToken: 'token' },
    status: 'authenticated',
  })

  const { result } = renderHook(() => useAuth())

  expect(result.current.isAuthenticated).toBe(true)
  expect(result.current.user).toEqual(user)
})
```

### 4. Component Tests

**Location:** `components/**/__tests__/*.test.tsx`

Tests UI components:
- Rendering
- User interactions
- Props handling
- Custom behavior

**Example:**
```typescript
it('should render table with data', () => {
  render(<DataTable columns={columns} data={mockData} />)

  expect(screen.getByText('Item 1')).toBeInTheDocument()
})

it('should handle row click', () => {
  const mockClick = jest.fn()
  render(<DataTable onRowClick={mockClick} {...props} />)
  
  fireEvent.click(screen.getByText('Item 1'))
  
  expect(mockClick).toHaveBeenCalled()
})
```

## Testing Patterns

### 1. Mocking Next.js Modules

```typescript
// jest.setup.ts
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/',
}))
```

### 2. Mocking NextAuth

```typescript
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: mockUser, accessToken: 'token' },
    status: 'authenticated',
  })),
}))
```

### 3. Testing Async Operations

```typescript
it('should load data on mount', async () => {
  render(<MyComponent />)

  await waitFor(() => {
    expect(screen.getByText('Loaded Data')).toBeInTheDocument()
  })
})
```

### 4. Testing User Interactions

```typescript
it('should handle form submission', async () => {
  const user = userEvent.setup()
  render(<LoginForm />)

  await user.type(screen.getByLabelText('Phone'), '+1234567890')
  await user.type(screen.getByLabelText('Password'), 'password')
  await user.click(screen.getByRole('button', { name: 'Login' }))

  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalled()
  })
})
```

### 5. Testing Error States

```typescript
it('should display error message on failure', async () => {
  apiClient.get = jest.fn().mockRejectedValueOnce(
    new Error('Network error')
  )

  render(<MyComponent />)

  await waitFor(() => {
    expect(screen.getByText(/network error/i)).toBeInTheDocument()
  })
})
```

## Coverage Goals

Aim for the following coverage targets:

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### Checking Coverage

```bash
npm run test:coverage
```

Coverage report will be generated in `coverage/lcov-report/index.html`.

## Best Practices

### 1. Test Naming

Use descriptive test names that explain what is being tested:

```typescript
// ❌ Bad
it('works', () => {})

// ✅ Good
it('should display error message when API call fails', () => {})
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should update state on button click', () => {
  // Arrange
  const mockHandler = jest.fn()
  render(<Button onClick={mockHandler} />)

  // Act
  fireEvent.click(screen.getByRole('button'))

  // Assert
  expect(mockHandler).toHaveBeenCalledTimes(1)
})
```

### 3. Use User Event Over FireEvent

```typescript
// ❌ Less realistic
fireEvent.click(button)

// ✅ More realistic user interaction
const user = userEvent.setup()
await user.click(button)
```

### 4. Query Priority

Use queries in this order:
1. `getByRole` - Most accessible
2. `getByLabelText` - Forms
3. `getByPlaceholderText` - Inputs
4. `getByText` - Non-interactive elements
5. `getByTestId` - Last resort

### 5. Avoid Implementation Details

```typescript
// ❌ Bad - testing implementation
expect(component.state.count).toBe(5)

// ✅ Good - testing behavior
expect(screen.getByText('Count: 5')).toBeInTheDocument()
```

### 6. Test Isolation

Each test should be independent:

```typescript
beforeEach(() => {
  jest.clearAllMocks()
  // Reset any shared state
})
```

### 7. Mock External Dependencies

```typescript
jest.mock('../api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))
```

## Common Testing Scenarios

### Testing Forms

```typescript
it('should validate form inputs', async () => {
  const user = userEvent.setup()
  render(<TripForm />)

  // Submit without filling
  await user.click(screen.getByRole('button', { name: 'Submit' }))

  // Check for validation errors
  expect(screen.getByText('Name is required')).toBeInTheDocument()
})
```

### Testing Tables

```typescript
it('should sort table by column', async () => {
  render(<TripsTable data={trips} />)

  await user.click(screen.getByText('Start Date'))

  const rows = screen.getAllByRole('row')
  expect(rows[1]).toHaveTextContent('Jan 01, 2025')
})
```

### Testing Modals

```typescript
it('should open and close delete confirmation modal', async () => {
  render(<TripsList />)

  await user.click(screen.getByLabelText('Delete'))
  expect(screen.getByText('Confirm Delete')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument()
})
```

### Testing Loading States

```typescript
it('should show loading skeleton while fetching', () => {
  render(<Dashboard loading={true} />)

  expect(screen.getAllByRole('status')).toHaveLength(4)
})
```

### Testing Pagination

```typescript
it('should navigate to next page', async () => {
  const mockPageChange = jest.fn()
  render(<DataTable pagination={{ page: 1, onPageChange: mockPageChange }} />)

  await user.click(screen.getByLabelText('Next page'))

  expect(mockPageChange).toHaveBeenCalledWith(2)
})
```

## Debugging Tests

### 1. View Rendered Output

```typescript
const { debug } = render(<MyComponent />)
debug() // Prints DOM to console
```

### 2. Query Available Roles

```typescript
screen.logTestingPlaygroundURL()
```

### 3. Check Query Selectors

```typescript
screen.getByRole('button', { name: /submit/i })
```

### 4. Use Testing Playground

Install extension: Testing Playground

## CI/CD Integration

Tests run automatically on:
- Push to main/develop branches
- Pull requests

### GitHub Actions Workflow

See `.github/workflows/test.yml` for the complete CI configuration.

## Next Steps

1. **Add E2E Tests** - Use Playwright for end-to-end testing
2. **Visual Regression** - Add screenshot testing with Percy or Chromatic
3. **Performance Tests** - Add Lighthouse CI for performance budgets
4. **Accessibility Tests** - Add axe-core for a11y testing

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Playground](https://testing-playground.com/)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

