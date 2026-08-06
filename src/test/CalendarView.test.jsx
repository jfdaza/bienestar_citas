import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock supabase module
vi.mock("../../lib/supabase", () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) => resolve({ data: [], error: null })),
    })),
  },
}));

// Must import after mock
const { CalendarView } = await import("../features/appointments/components/CalendarView");

describe("CalendarView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAppointments = [
    {
      id: "apt-1",
      status: "pending",
      scheduled_date: "2026-07-15",
      scheduled_time: "10:00",
      dependencies: { name: "Psicología" },
      profiles: { full_name: "Juan Pérez" },
    },
    {
      id: "apt-2",
      status: "confirmed",
      scheduled_date: "2026-07-15",
      scheduled_time: "14:30",
      dependencies: { name: "Enfermería" },
      profiles: { full_name: "María López" },
    },
  ];

  it("renders current month name", () => {
    render(<CalendarView appointments={[]} />);
    expect(screen.getByText(/Julio 2026/)).toBeInTheDocument();
  });

  it("renders day headers", () => {
    render(<CalendarView appointments={[]} />);
    expect(screen.getByText("Lun")).toBeInTheDocument();
    expect(screen.getByText("Mar")).toBeInTheDocument();
    expect(screen.getByText("Mié")).toBeInTheDocument();
    expect(screen.getByText("Jue")).toBeInTheDocument();
    expect(screen.getByText("Vie")).toBeInTheDocument();
    expect(screen.getByText("Sáb")).toBeInTheDocument();
    expect(screen.getByText("Dom")).toBeInTheDocument();
  });

  it("renders go to today button", () => {
    render(<CalendarView appointments={[]} />);
    expect(screen.getByText("Volver a hoy")).toBeInTheDocument();
  });

  it("shows legend with dots", () => {
    render(<CalendarView appointments={[]} />);
    expect(screen.getByText("Con citas")).toBeInTheDocument();
    expect(screen.getByText("Hoy")).toBeInTheDocument();
  });

  it("shows busy slots indicator in legend", () => {
    render(<CalendarView appointments={[]} dependencyId="dep-1" />);
    expect(screen.getByText("Horarios ocupados")).toBeInTheDocument();
  });

  it("shows appointments for selected day", () => {
    render(<CalendarView appointments={mockAppointments} dependencyId="dep-1" />);
    
    // Find day 15 button
    const day15 = screen.getByText("15", { selector: "button" });
    fireEvent.click(day15);

    expect(screen.getByText("15 de Julio")).toBeInTheDocument();
    expect(screen.getByText("Psicología")).toBeInTheDocument();
    expect(screen.getByText("Enfermería")).toBeInTheDocument();
  });
});
