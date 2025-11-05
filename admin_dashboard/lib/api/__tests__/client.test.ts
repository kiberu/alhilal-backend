import { ApiClient } from '../client'

describe('ApiClient', () => {
  let client: ApiClient

  beforeEach(() => {
    client = new ApiClient('http://localhost:8000/api/v1/')
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('buildURL', () => {
    it('should build URL with base URL and endpoint', () => {
      const url = (client as any).buildURL('trips')
      expect(url).toBe('http://localhost:8000/api/v1/trips')
    })

    it('should build URL with query parameters', () => {
      const url = (client as any).buildURL('trips', { page: 1, size: 10 })
      expect(url).toContain('page=1')
      expect(url).toContain('size=10')
    })

    it('should skip undefined parameters', () => {
      const url = (client as any).buildURL('trips', { page: 1, name: undefined })
      expect(url).toContain('page=1')
      expect(url).not.toContain('name')
    })
  })

  describe('GET requests', () => {
    it('should make GET request with authorization header', async () => {
      const mockResponse = { success: true, data: { id: '1', name: 'Test Trip' } }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      })

      const result = await client.get('trips/1', undefined, 'test-token')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('trips/1'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle 401 errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Unauthorized' }),
      })

      await expect(client.get('trips', undefined, 'invalid-token')).rejects.toMatchObject({
        status: 401,
        message: 'Unauthorized',
      })
    })
  })

  describe('POST requests', () => {
    it('should make POST request with JSON body', async () => {
      const mockData = { name: 'New Trip', startDate: '2025-01-01' }
      const mockResponse = { success: true, data: { id: '1', ...mockData } }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      })

      const result = await client.post('trips', mockData, undefined, 'test-token')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('trips'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          }),
          body: JSON.stringify(mockData),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Error handling', () => {
    it('should retry on network errors', async () => {
      const client = new ApiClient('http://localhost:8000/api/v1/', 30000, 2, 100)
      
      ;(global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true }),
        })

      const result = await client.get('trips')
      
      expect(global.fetch).toHaveBeenCalledTimes(3)
      expect(result).toEqual({ success: true })
    })

    it('should not retry on 4xx errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Not found' }),
      })

      await expect(client.get('trips/999')).rejects.toMatchObject({
        status: 404,
      })
      
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })
})

