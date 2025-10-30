import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable, type Column } from '../DataTable'

interface TestData {
  id: string
  name: string
  status: string
}

describe('DataTable', () => {
  const mockData: TestData[] = [
    { id: '1', name: 'Item 1', status: 'active' },
    { id: '2', name: 'Item 2', status: 'inactive' },
    { id: '3', name: 'Item 3', status: 'active' },
  ]

  const columns: Column<TestData>[] = [
    { key: 'name', header: 'Name' },
    { key: 'status', header: 'Status' },
  ]

  it('should render table with data', () => {
    render(<DataTable columns={columns} data={mockData} />)

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('should render loading state', () => {
    render(<DataTable columns={columns} data={[]} loading />)

    // Should show skeleton loaders
    const skeletons = screen.getAllByRole('row')
    expect(skeletons.length).toBeGreaterThan(1) // Header + skeleton rows
  })

  it('should render empty state', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyMessage="No items found"
        emptyDescription="Try adjusting your filters"
      />
    )

    expect(screen.getByText('No items found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument()
  })

  it('should render custom cell content', () => {
    const customColumns: Column<TestData>[] = [
      {
        key: 'name',
        header: 'Name',
        render: (item) => <strong>{item.name.toUpperCase()}</strong>,
      },
    ]

    render(<DataTable columns={customColumns} data={mockData} />)

    expect(screen.getByText('ITEM 1')).toBeInTheDocument()
  })

  it('should handle row click', () => {
    const mockRowClick = jest.fn()

    render(
      <DataTable
        columns={columns}
        data={mockData}
        onRowClick={mockRowClick}
      />
    )

    const firstRow = screen.getByText('Item 1').closest('tr')
    fireEvent.click(firstRow!)

    expect(mockRowClick).toHaveBeenCalledWith(mockData[0])
  })

  it('should render pagination', () => {
    const mockPageChange = jest.fn()
    const pagination = {
      page: 2,
      totalPages: 5,
      totalItems: 50,
      pageSize: 10,
      onPageChange: mockPageChange,
    }

    render(
      <DataTable
        columns={columns}
        data={mockData}
        pagination={pagination}
      />
    )

    expect(screen.getByText(/Showing 11 to 20 of 50 results/)).toBeInTheDocument()

    // Click next page button
    const buttons = screen.getAllByRole('button')
    const nextButton = buttons.find((btn) => !btn.disabled && btn.querySelector('svg'))
    
    if (nextButton) {
      fireEvent.click(nextButton)
      expect(mockPageChange).toHaveBeenCalled()
    }
  })

  it('should apply custom className', () => {
    const customColumns: Column<TestData>[] = [
      {
        key: 'name',
        header: 'Name',
        className: 'custom-class',
      },
    ]

    const { container } = render(
      <DataTable columns={customColumns} data={mockData} />
    )

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('should handle ReactNode as header', () => {
    const customColumns: Column<TestData>[] = [
      {
        key: 'name',
        header: <span data-testid="custom-header">Custom Header</span>,
      },
    ]

    render(<DataTable columns={customColumns} data={mockData} />)

    expect(screen.getByTestId('custom-header')).toBeInTheDocument()
  })
})

