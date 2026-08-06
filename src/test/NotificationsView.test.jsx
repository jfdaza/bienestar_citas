import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationsView } from "../features/appointments/components/NotificationsView";

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("NotificationsView", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  const mockAppointments = [
    {
      id: "apt-1",
      status: "cancelled",
      scheduled_date: "2026-07-05",
      scheduled_time: "10:00",
      notes: "El profesional no está disponible",
      updated_at: new Date(Date.now() - 3600000).toISOString(),
      dependencies: { name: "Psicología" },
    },
    {
      id: "apt-2",
      status: "confirmed",
      scheduled_date: "2026-07-10",
      scheduled_time: "14:30",
      updated_at: new Date(Date.now() - 7200000).toISOString(),
      dependencies: { name: "Trabajo Social" },
    },
    {
      id: "apt-3",
      status: "pending",
      scheduled_date: "2026-07-15",
      scheduled_time: "09:00",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      dependencies: { name: "Enfermería" },
    },
  ];

  it("renders empty state when no appointments", () => {
    render(<NotificationsView appointments={[]} />);
    expect(screen.getByText("Sin notificaciones")).toBeInTheDocument();
  });

  it("renders notifications list", () => {
    render(<NotificationsView appointments={mockAppointments} />);
    expect(screen.getByText("Notificaciones")).toBeInTheDocument();
    expect(screen.getByText("Cita cancelada")).toBeInTheDocument();
    expect(screen.getByText("Cita confirmada")).toBeInTheDocument();
    expect(screen.getByText("Cita pendiente")).toBeInTheDocument();
  });

  it("shows unread count", () => {
    render(<NotificationsView appointments={mockAppointments} />);
    expect(screen.getByText(/3 sin leer/)).toBeInTheDocument();
  });

  it("expands notification on click", () => {
    render(<NotificationsView appointments={mockAppointments} />);
    
    const cancelledTitle = screen.getByText("Cita cancelada");
    // Click the parent div that has the onClick handler
    const notifContainer = cancelledTitle.closest("[style]");
    // Find the clickable parent (the one with cursor: pointer)
    let clickTarget = notifContainer;
    while (clickTarget && !clickTarget.style.cursor?.includes("pointer")) {
      clickTarget = clickTarget.parentElement;
    }
    if (clickTarget) {
      fireEvent.click(clickTarget);
    }

    expect(screen.getByText(/El profesional no está disponible/)).toBeInTheDocument();
  });

  it("shows mark all read button when there are unread", () => {
    render(<NotificationsView appointments={mockAppointments} />);
    expect(screen.getByText("Marcar todo leído")).toBeInTheDocument();
  });

  it("renders notification titles", () => {
    render(<NotificationsView appointments={mockAppointments} />);
    const cancelled = screen.getByText("Cita cancelada");
    const confirmed = screen.getByText("Cita confirmada");
    const pending = screen.getByText("Cita pendiente");
    expect(cancelled).toBeInTheDocument();
    expect(confirmed).toBeInTheDocument();
    expect(pending).toBeInTheDocument();
  });
});
